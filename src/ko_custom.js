var ko = require('knockout');
var $ = require('jquery');
require('../libs/arrive.min.js');

ko.bindingHandlers['read_href'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        function updateModel() {
            // This updates the model value from the view value.
            // It runs in response to DOM events (propertychange).
            var elemValue = element.getAttribute("href");

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'read_href', elemValue, true);
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (href) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());
			
			if (modelValue !== null && modelValue !== undefined) {
				element.setAttribute("href", modelValue);
			} else {
				element.removeAttribute("href");
			}
        };
		
        // Set up two computeds to update the binding:

        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
        ko.utils.registerEventHandler(element, "propertychange", updateModel);

        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['read_href'] = true;

ko.bindingHandlers['read_text'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        function updateModel() {
            // This updates the model value from the view value.
            var elemValue = element.textContent;

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'read_text', elemValue, true);
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (href) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());
			
			if (modelValue !== null && modelValue !== undefined) {
				element.textContent = modelValue;
			} else {
				element.textContent = "";
			}
        };
		
        // Set up two computeds to update the binding:

        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });

        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['read_text'] = true;

$(document).leave("[data-listen-leave]", function() {
	var callback = $(this).data("leave-callback");
	if (typeof callback === "function") {
		callback.call(null, this);
	}
});

ko.bindingHandlers['leave'] = {
	'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var callback = function() {
			var handlerFunction = valueAccessor();
			handlerFunction.apply(bindingContext['$data']);
		};
		$(element).attr("data-listen-leave", true);
		$(element).data("leave-callback", callback);
	},
	'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var callback = function() {
			var handlerFunction = valueAccessor();
			handlerFunction.apply(bindingContext['$data']);
		};
		$(element).data("leave-callback", callback);
	}
};