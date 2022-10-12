// Object assign polyfill
if (typeof Object.assign != "function") {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) {
			// .length of function is 2
			"use strict";
			if (target == null) {
				// TypeError if undefined or null
				throw new TypeError(
					"Cannot convert undefined or null to object"
				);
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource != null) {
					// Skip over if undefined or null
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (
							Object.prototype.hasOwnProperty.call(
								nextSource,
								nextKey
							)
						) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true,
	});
}

// Basic Mutation Observer runs on dom ready and on interval
if (!("MutationObserver" in window)) {
	// do stuff

	window.MutationObserver = function (fn) {
		this.observe = function () {
			// If document is already loaded, run method
			if (document.readyState === "complete") {
				fn();
			}

			// Otherwise, wait until document is loaded
			document.addEventListener("DOMContentLoaded", fn, false);

			setInterval(fn, 1000);
		};
	};
}

function site(config) {
	var site = {};

	// select the target node from config, or default to the document
	var target = config.hasOwnProperty("target") ? config.target : document;
	var HANDLED = [];
	var COMPONENTS = {};

	// Data store for this site
	var DATA = {};
	var KEYS_CHANGED = [];

	/*
		Observe the DOM for changes
	*/
	var observer = new MutationObserver(function (mutations) {
		var components = getUnhandledComponents();

		if (components.length) {
			handleNodes({ nodes: components });
		}
	});

	/*
		getComponents
		Search the DOM for unhandled components
	*/

	function getUnhandledComponents() {
		var components = target.querySelectorAll(
			"[data-ui]:not([data-handled])"
		);

		return components;
	}

	/*
		handleNodes
		Initialise an array of Elements component
	*/

	function handleNodes(settings) {
		var nodes = settings.nodes;

		for (i = 0; i < nodes.length; i++) {
			/*
				
				1 = Element
				2 = attribute
				3 = text
				8 = comment

			*/
			if (nodes[i].nodeType == 1) {
				if (nodes[i].getAttribute("data-ui")) {
					var isHandled = HANDLED.indexOf(nodes[i]) != -1;
					//var isHandled = nodes[i].getAttribute('data-handled');
					if (!isHandled) {
						var types = nodes[i].getAttribute("data-ui").split(",");

						HANDLED.push(nodes[i]);
						nodes[i].setAttribute("data-handled", true);

						var t;
						for (t = 0; t < types.length; t++) {
							var type = types[t];

							mountComponent(nodes[i], type);
						}
					} else {
						// Already handled this node
						//console.log('Already handled',nodes[i]);
					}
				}
			}
		}
	}

	/*
		withActiveNodes
		Loop through all active nodes and run a callback with the node and the type
	*/

	function withActiveNodes(callback) {
		var nodes = HANDLED;

		for (i = 0; i < nodes.length; i++) {
			var types = nodes[i].getAttribute("data-ui").split(",");

			var t;
			for (t = 0; t < types.length; t++) {
				var type = types[t];

				callback(nodes[i], type);
			}
		}
	}

	/*
		addUI
		Register a component
	*/

	function addUI(label, component) {
		//var DOMName = label.charAt(0).toUpperCase() + label.slice(1);
		//site['UI'+DOMName] = document.registerElement('ui-'+label);

		var base = {
			init: function () {},
			onFind: function () {},
			onRemove: function () {},
		};

		if (typeof component == "function") {
			base.onFind = component;
		} else {
			// TODO: Copy and extend base
			base = component;
		}

		COMPONENTS[label] = base;
	}

	/*
		mountComponent
		New component has appeared
	*/

	function mountComponent(node, type) {
		if (!COMPONENTS.hasOwnProperty(type)) return;
		var onFind = COMPONENTS[type].onFind;
		if (onFind) onFind.call(node);
	}

	/*
		unmountComponent
		Component has been removed
	*/

	function unmountComponent(node, type) {
		if (!COMPONENTS.hasOwnProperty(type)) return;
		var onRemove = COMPONENTS[type].onRemove;
		if (onRemove) onRemove.call(node);
	}

	function setData(label, value, publish) {
		DATA[label] = value;
		KEYS_CHANGED.push(label);

		if (
			typeof publish == "undefined" ||
			(typeof publish != "undefined" && publish)
		) {
			dataChanged();
		}
	}

	function getData(label) {
		return label ? DATA[label] : DATA;
	}

	function dataChanged() {
		//var data = Object.assign({},DATA);
		var data = DATA;

		withActiveNodes(function (node, type) {
			var com = COMPONENTS[type];
			if (com && com.hasOwnProperty("onDataChanged")) {
				var doUpdate = 0;
				var watchKeys = node.getAttribute("data-watch");
				if (watchKeys) {
					var watchArr = watchKeys.split(",");
					for (k = 0; k < KEYS_CHANGED.length; k++) {
						if (watchArr.indexOf(KEYS_CHANGED[k]) != -1)
							doUpdate = 1;
					}
				} else {
					doUpdate = 1;
				}
				if (doUpdate) com.onDataChanged.call(node, data, KEYS_CHANGED);
			}
		});

		KEYS_CHANGED = [];
	}

	var observerconfig = {
		subtree: true,
		attributes: false,
		childList: true,
		characterData: false,
	};

	this.addUI = addUI;
	this.setData = setData;
	this.getData = getData;

	this.run = function () {
		// pass in the target node, as well as the observer options
		observer.observe(target, observerconfig);
	};

	return this;
}
