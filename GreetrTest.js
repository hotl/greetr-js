// Create a new Execution Context to avoid collisions within the global object

(function(global, $) {
	// Define a local copy of Greetr
	// Can avoid initializing without always calling the 'new' keyword
	var Greetr = function(firstName, lastName, language) {
		return new Greetr.init(firstName, lastName, language);
	};

	// All objects sitting in this IIFE's lexical environment will have access to next few variables (closure)
	// Keep these variables outside the Greetr.prototype so that they are not overwritten

	const API_KEY = "YOUR_API_KEY";
	const TRANSLATION_URL = "https://www.googleapis.com/language/translate/v2?key=" + API_KEY;

	// Defined for stylistic purposes. Assigned to Greetr.init.prototype
	Greetr.prototype = {

		buildURL: function(message, source, target) {
			// Make this a private method
			return TRANSLATION_URL.concat(message)
				.concat("&source=")
				.concat(source)
				.concat("&target=")
				.concat(target);
		},

		fullName: function() {
			return this.firstName + ' ' + this.lastName;
		},

		greeting: function(callback) {
			var self = this;
			var greetPromise = this.setGreetLevel('Hello');
			greetPromise.then(function(response) {
				var greeting = response.data.translations[0].translatedText + ' ' + self.firstName;
				callback(greeting);
			});
		},

		formalGreeting: function() {
			this.setGreetLevel('Greetings');
			return this.message + ' ' + this.fullName();
		},

		createMsg: function(formal) {
			return (!formal) ? this.greeting() : this.formalGreeting();
		},

		greet: function(formal) {
			// 'this' refers to the calling object at execution time
			// method only to be called once self.language !== 'en'
			var self = this;
			var greetPromise;
			if (formal && console)
			{
				greetPromise = self.setGreetLevel('Greetings');
				greetPromise.then(function(response) 
				{
					console.log(response.data.translations[0].translatedText + ' ' + self.firstName);
				});
			}
			else
			{
				greetPromise = self.setGreetLevel('Hello');
				greetPromise.then(function(response) {
					console.log(response.data.translations[0].translatedText + ' ' + self.firstName);
				});
			}
			
			// makes this method chainable
			return self;
		},

		log: function() {
			this.setGreetLevel('Logged in');
			if (console) {
				console.log(this.message + ': ' + this.fullName());
			}
			return this;
		},

		changeHTMLToGreeting: function(selector) {
			var self = this;
			if (!$) {
				throw 'jQuery not loaded';
			}
			if (!selector) {
				throw 'Missing jQuery selector';
			}

			setTimeout(function() {
				if ($(selector).length) 
				{
					console.log("message: " + self.message);
					$(selector).html(self.message + ' ' + self.fullName());
				} 
				else 
				{
					throw 'jQuery selector not found';
				}
			}, 100);
				
			return self;
		},

		setGreetLevel: function(newGreetLevel) {
			var self = this;
			var promise;
			if (self.language !== 'en') {
				promise = self.translateMessage('en', self.language, newGreetLevel);
				promise.then(function(response) {
					self.message = response.data.translations[0].translatedText;
				});
				return promise;
			} else {
				self.message = newGreetLevel;
			}
			return this;
		},

		translateMessage: function(oldLanguage, newLanguage, message) {
			var self = this;
			return new Promise(function(resolve, reject) {
				self.xhr.open('GET', self.buildURL(message, oldLanguage, newLanguage), true);
				self.xhr.send();
				self.xhr.onreadystatechange = function() {
					if (this.readyState === 4 && this.status === 200) {
						var response = JSON.parse(this.responseText);
						resolve(response);
					}
				}
			});
		},

		setLanguage: function(newLanguage) {
			var self = this;
			if (newLanguage === self.language) {
				throw 'Must designate a new language';
			}
			var promise = self.translateMessage(self.language, newLanguage, self.message);
			promise.then(function(response) {
				self.message = response.data.translations[0].translatedText;
				self.language = newLanguage;
			});
			
			return this;
		}
	};

	// function constructor
	Greetr.init = function(firstName, lastName, language) {
		
		var self = this;
		self.firstName = firstName || '';
		self.lastName = lastName || '';
		self.language = language || 'en';
		self.message = 'Hello';
		self.xhr = new XMLHttpRequest();

	}

	// All objects returned from Greetr.init will point to Greetr.prototype for prototype chain
	Greetr.init.prototype = Greetr.prototype;

	global.Greetr = global.G$ = Greetr;


}(window, jQuery));

