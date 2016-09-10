var g = G$('John', 'Doe');

$("#login").click(function() {

	g.setLanguage($('#lang').val()).changeHTMLToGreeting("#greeting, #greeting2");
})


