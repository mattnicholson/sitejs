(function () {
	var demo = new site({ target: document });
	var addUI = demo.addUI;
	var setData = demo.setData;
	var getData = demo.getData;

	var DATA = getData();

	addUI("hello", function () {
		this.innerHTML = "Hello World";
	});

	addUI("color", function () {
		var bg = this.getAttribute("data-bg");
		this.style.backgroundColor = bg;
	});

	addUI("adder", function () {
		this.innerHTML =
			'<button data-ui="clicker">Add Item</button><a data-ui="link" href="#tester">Tester link!</a><span data-ui="color" data-bg="yellow">Yellow</span>';
	});

	addUI("item", function () {
		this.innerHTML = '<div class="Item">' + this.innerHTML + "</div>";
	});

	addUI("img", function () {
		this.innerHTML =
			'<img data-ui="hello" src="' +
			this.getAttribute("data-src") +
			'" />';
	});

	addUI("dataviewoff", function () {
		this.innerHTML = "SNOO";
	});

	addUI("dataview", {
		onFind: function () {
			this.template = this.innerHTML;
			var data = Object.assign({}, DATA);
			nunjucks.configure({ autoescape: true });

			this.innerHTML = nunjucks.renderString(this.template, data);
		},
		onDataChanged: function (data, keys) {
			console.log(data);

			nunjucks.configure({ autoescape: true });
			this.innerHTML = nunjucks.renderString(this.template, data);
		},
	});

	addUI("dataload", {
		onFind: function () {
			var xhr = new XMLHttpRequest();
			let proto = window.location.protocol;
			if (!proto.match("http")) proto = "http:";

			xhr.open("GET", proto + "//jsonplaceholder.typicode.com/photos");
			xhr.onload = function () {
				if (xhr.status === 200) {
					var albums = JSON.parse(xhr.responseText);

					setData("page", 1);

					setData("perPage", 25);
					setData("albums", albums);
				} else {
					alert("Request failed.  Returned status of " + xhr.status);
				}
			};
			xhr.send();
		},
	});

	addUI("router", function () {
		setData("uri", window.location.href);
		window.onpopstate = function () {
			setData("uri", window.location.href);
		};
	});

	addUI("link", function () {
		this.addEventListener("click", function (ev) {
			ev.preventDefault();

			window.history.pushState(
				{},
				this.getAttribute("href"),
				this.getAttribute("href")
			);
			setData("uri", window.location.href);
		});
	});

	addUI("add", function () {
		this.addEventListener("click", function () {
			var item = document.createElement("LI");
			item.innerHTML =
				'<div data-bg="blue" data-ui="hello,adder,color">Item</div>';

			document.getElementById("things").appendChild(item);
		});
	});

	addUI("hello", function () {
		this.addEventListener("click", function () {
			alert("msg" + this.getAttribute("data-message"));
		});
	});

	addUI("setcolor", function () {
		this.addEventListener("blur", function () {
			setData("color", this.value);
		});
	});

	addUI("range", function () {
		let key = this.getAttribute("data-key");

		this.addEventListener("input", function () {
			setData(key, this.value);
		});
	});

	addUI("typeSize", {
		onFind: function () {
			setData("typeSize", 50);
		},
		onDataChanged: function (data, keys) {
			console.log("fontsize", data["typeSize"]);
			this.style.fontSize = data["typeSize"] + "px";
		},
	});

	addUI("clicker", function () {
		//var items = [];
		//setData('items',items);

		this.addEventListener("click", function () {
			var item = document.createElement("LI");
			item.innerHTML =
				'<div data-ui="color" data-bg="green"><div data-ui="item"><div data-ui="img" data-src="https://images.unsplash.com/photo-1541599468348-e96984315921?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=75314eaa14a121a4f0db49d894ce63fc&auto=format&fit=crop&w=655&q=80"></div></div>';

			document.getElementById("things").appendChild(item);
			//items.push('item');
			setData(
				"items",
				document.getElementById("things").childElementCount
			);
		});
	});

	addUI("nextPage", function () {
		//var items = [];
		//setData('items',items);

		this.addEventListener("click", function () {
			var cur = getData("page");
			setData("page", cur + 1);
		});
	});

	addUI("prevPage", function () {
		//var items = [];
		//setData('items',items);

		this.addEventListener("click", function () {
			var cur = getData("page");
			var prev = cur - 1;
			if (prev < 1) prev = 1;
			setData("page", prev);
		});
	});

	addUI("pageCount", function () {
		this.addEventListener("change", function () {
			setData("perPage", parseInt(this.value));
		});
	});

	// ^^ Keep your scripts inside this IIFE function call to
	// avoid leaking your variables into the global scope.
})();
