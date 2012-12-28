var prevVal = null,
    col_height,
    indexElements = {
      admin     : '#admin',
      title     : '#post_title',
      content   : '#post_content',
      section   : '.split-section',
      published : '#published',
      drafts    : '#drafts',
      curCol    : '#drafts',
      curColUl  : '#drafts ul',
      curItem   : '#drafts li:first'
    };

$.subscribe('index:enter', function() {
  el = fn.getjQueryElements(indexElements);

  el.title.focus();
  selectItem(el.curItem);
  makeExpandingAreas();
  setColumnHeights();
  setupFiltering();
  state.colIndex = 0;
  state.itemIndex = [0, 0];
});

$(window).resize(setColumnHeights);

function setupFiltering() {
  // Filtering and other functions with the title field
  var draftsItems    = $('#drafts ul').data('items'),
      publishedItems = $('#published ul').data('items');

  el.title
    .keyup(function titleKeyup(e) {
      if (!state.editing) {
        // Filtering
        var val = $(this).val();
        if (val && val != prevVal) {
          prevVal = val;
          var draftIds = filterTitle(draftsItems, val),
              pubIds   = filterTitle(publishedItems, val);

          draftIds ? showOnly('#drafts li', draftIds) : $('#drafts li').addClass('hidden');
          pubIds   ? showOnly('#published li', pubIds) : $('#published li').addClass('hidden');

          if (!draftIds && !pubIds) setEditing(true);

          state.itemIndex[0] = 0;
          state.itemIndex[1] = 0;

          var item = $('.col li:not(.hidden):first');
          selectItem(item);
          updateItemState(item);
        }
        else if (!val) {
          $('#drafts li,#published li').removeClass('hidden');
        }
      }
    })
    .keydown(function titleKeydown(e) {
      if (!state.editing) {
        switch (e.which) {
          // Esc
          case 27:
            e.preventDefault();
            el.title.val('');
            $('#drafts li,#published li').removeClass('hidden');
            break;
        }
      }
    });
}

function showOnly(context, indices) {
  $(context).each(function() {
    $(this).toggleClass('hidden', !_.contains(indices, $(this).data('id')));
  });
}

// Set column height
function setColumnHeights() {
  if (state.editing) return false;

  var content_height = Math.max($(window).height() - el.title.height()-40,100);
  col_height = $(window).height()-125;

  $('.col ul').css('height', col_height);
  el.content.css('min-height', content_height);
  $('#content-fieldset').css('height', content_height);
  return col_height;
}

// Highlight an item in the column
function selectItem(object, items) {
  fn.log(object);
  el.curItem.removeClass('selected');
  el.curItem = object.addClass('selected');
  return el.curItem.index();
}

function updateItemState(object) {
  var colIndex = object.parents('.col').index();
  if (colIndex != state.colIndex) changeCol();
  state.colIndex = colIndex;

  state.itemIndex[colIndex] = el.curItem.index();
}

// Either uses cache or loads post
function editSelectedItem(callback) {
  el.curItem.children('a')[0].click();
}

// Highlight column
function changeCol() {
  el.curItem.removeClass('selected');

  // to Drafts
  if (el.curCol.is('#published')) {
    state.colIndex = 0;
    el.published.removeClass('active');
    el.curCol = el.drafts.addClass('active');
  }
  // to Published
  else {
    state.colIndex = 1;
    el.drafts.removeClass('active');
    el.curCol = el.published.addClass('active');
  }

  selectItem(el.curCol.find('li:not(.hidden):eq('+state.itemIndex[state.colIndex]+')'));
  el.curColUl = el.curCol.find('ul');
}

function filterTitle(objects, val) {
  return objects.filter(function filterTitleObjects(el) {
      var regex = new RegExp(val.split('').join('.*'), 'i');
      if (el.title.match(regex)) return true;
    }).map(function filterTitleMap(el) {
      return el.id;
    });
}