var initializer = function() {
  setupSearchSelect(document);

  $(document).on('has_many_add:after', function(event, container) {
    setupSearchSelect(container);
  });

  function setupSearchSelect(container) {
    var INVALID_PARENT_ID = -1;
    $('.search-select-input, .search-select-filter-input, ajax-filter-input', container).each(function(i, el) {
      var element = $(el);
      var url = element.data('url');
      var fields = element.data('fields');
      var predicate = element.data('predicate');
      var displayName = element.data('display-name');
      var width = element.data('width');
      var responseRoot = element.data('response-root');
      var minimumInputLength = element.data('minimum-input-length');
      var order = element.data('order');

      var parent = element.data('parent');
      var model = element.data('model');
      var parentId = element.data('parent-id');

      var selectOptions = {
        width: width,
        minimumInputLength: minimumInputLength,
        placeholder: '',
        allowClear: true,
        ajax: {
          url: url,
          dataType: 'json',
          delay: 250,
          cache: true,
          data: function(params) {
            var textQuery = { m: 'or' };
            fields.forEach(function(field) {
              if (field == 'id') {
                textQuery[field + '_eq'] = params.term;
              } else {
                textQuery[field + '_' + predicate] = params.term;
              }
            });

            var query = {
              order: order,
              q: {
                groupings: [textQuery],
                combinator: 'and',
              },
            };

            if (!!parent) {
              query.q[parent + '_eq'] = parentId;
            }

            return query;
          },
          processResults: function(data) {
            if (data.constructor == Object) {
              data = data[responseRoot];
            }

            return {
              results: jQuery.map(data, function(resource) {
                if (!resource[displayName]) {
                  resource[displayName] = 'No display name for id #' + resource.id.toString();
                }
                return {
                  id: resource.id,
                  text: resource[displayName].toString(),
                };
              }),
            };
          },
        },
      };

      $(el).select2(selectOptions);

      function setParentValue(e) {
        element.val(null).trigger('select2:select').trigger('change');
        parentId = (e.params && e.params.data.id) ? e.params.data.id : INVALID_PARENT_ID;
        element.data('parent-id', parentId);
      }

      if (!!parent) {
        var parentSelectorId = '#' + model + '_' + parent;
        var parentSelector = $(parentSelectorId)[0];
        $(parentSelector).on('select2:select', setParentValue);
        $(parentSelector).on('select2:unselect', setParentValue);
        parentId = $(parentSelector).val()
        element.data('parent-id', parentId);
      }
    });
  }
};

$(initializer);
$(document).on('turbolinks:load', initializer);
