//window.fbAsyncInit is called only after the Facebook SDK is completely loaded client-side.
//The SDK is loaded in the next function, the one that follows window.fbAsyncInit.
window.fbAsyncInit = function() {
	//Initializing the FB object with out App ID and other details;
	FB.init({
		appId      : '559853050780412',
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});

	//Facebook Login Status can be checked two ways: 1. Deliberately asking for the login status, using
	//the getLoginStatus() method, or always listening for changes in login status, using the Event.subscribe
	//method (the next one).
	
	//Each time the page is loaded, we deliberately ask for login status once using getLoginStatus. If it is connected
	//the statements in the next method's connected section will be executed. If not, then we must render the login
	//page.
	FB.getLoginStatus(function(response) {
		if(response.status === 'connected') {
			//connected
		}
		else if(response.status == 'not_authorized' || response.status == 'unknown') {
			renderLogin();
		}
	});

	//Using the Event.subscribe method, we are always listening to changes in authorization status.
	// Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  	// for any authentication related change, such as login, logout or session refresh. This means that
  	// whenever someone who was previously logged out tries to log in again, the correct case below 
  	// will be handled.
	FB.Event.subscribe('auth.authResponseChange', function(response) {
		// Here we specify what we do with the response anytime this event occurs.
		if (response.status === 'connected') {
			// The response object is returned with a status field that lets the app know the current
      			// login status of the person. In this case, we're handling the situation where they 
      			// have logged in to the app.
			console.log('Login status: app connected to Facebook');
			renderApp();
		} else if (response.status === 'not_authorized') {
			// In this case, the person is logged into Facebook, but not into the app, so we call
		        // renderLogin() to render the login page through which users may log in.
			console.log('Login status: user logged in but app not authorized; proceeding to ask for permission');
			renderLogin();
		} else {
			// In this case, the person is not logged into Facebook, so we call the renderLogin() 
		        // function to render the login page through which users may log in. Note that at this 
		        // stage there is no indication of whether they are logged into the app. 
		        // If they aren't then they'll see the Login dialog right after they log in to Facebook. 
			console.log('Login status: user logged out. Login button is visible.');
			renderLogin();
		}
	});
};

// Load the SDK (Software Development Kit) asynchronously
(function(d){
	console.log('Loading Facebook SDK asynchronously');
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

var graphURL = "https://graph.facebook.com/chickfila/posts?" +
                     "callback=processResult&limit=5";

// Use JSONP to call the Graph API
function loadPosts() {
	var script = document.createElement("script");
	script.src = graphURL;
	document.body.appendChild(script);
}

function processResult(posts) {
  	if (posts.paging == undefined) {
    	document.getElementById("loadMore").innerHTML ="No more results";
	} else {
		graphURL = posts.paging.next;
		for (var post in posts.data) {
			var message = document.createElement("div");
			message.innerHTML = posts.data[post].message;
			document.getElementById("content").appendChild(message);
		}
  	}
}

//Renders the login page when the user isn't already logged in
function renderLogin() {
	console.log('renderLogin was called');
	$('body').removeClass('app_page');
	$('body').addClass('login_page');

	var loginButton = document.createElement('button');
	loginButton.setAttribute('id', 'loggerButton');
	loginButton.setAttribute('onclick', 'loginToApp()');
	loginButton.innerHTML = 'Login to Facebook';

	$('#container').append(loginButton);
}

//Renders the app when the user is logged in
function renderApp() {
	console.log('renderApp was called');

	//Removing Login Page elements
	$('body').removeClass('login_page');
	$('body').addClass('app_page');

	$('#loggerButton').remove();

	//Creating App Page Elements
	
	//Creating an img tag for the profile picture
	//and adding it to the page
	var profilePicture = document.createElement('img');
	$('#container').append(profilePicture);

	//Actually getting the picture from Facebook and adding
	//it to the img tag we created above
	FB.api('/me/picture?type=large', function(response) {
		var pictureURL = response.data.url;
		profilePicture.setAttribute('src', pictureURL);
	});

	//Creating a div to hold the user's name
	//and adding it to the page
	var nameDiv = document.createElement('div');
	nameDiv.setAttribute('id', 'name');
	$('#container').append(nameDiv);

	//Actually getting the name from Facebook and adding
	//it to the div we created above
	FB.api('/me', function(response) {
		nameDiv.innerHTML = 'Hello, ' + response.name;
		// console.log("*****************************");
		// console.log(response);
		// console.log("*****************************");
	});

	var id = "/me"
	FB.api('/me/friends', function(response) {
		console.log("*****************************");
		console.log(response);
		var friend = response.data[0];
		id="/"+friend.id;
		console.log(id);
		FB.api(id+'/photos', function(response) {
			console.log("*#****************************");
			console.log(response);
			console.log("*FFF****************************");
			var arr = response.data;
			for(x in arr){
				$('#container').append("<img src='"+arr[x].picture+"'>");
			}
		});
		console.log("*****************************");
		FB.api(id+"/albums/", function(response){
			console.log("*&*&*&*&*&*&*&*&*&*&*&*&*&");
			console.log(response);
			console.log("*&*&*&*&*&*&*&*&*&*&*&*&*&");
		
		});
		FB.api(id+"/photos/uploaded", function(response){
			console.log("^%^%^%^%^%^%^%^%^%^%^%^%");
			console.log(response);
			console.log("^%^%^%^%^%^%^%^%^%^%^%^%");
			
		});
	});



	FB.api('/me/home', function(response) {
		console.log(response);
	});

	//Creating an input box for the status message
	var statusBox = document.createElement('input');
	statusBox.setAttribute('type', 'text');
	statusBox.setAttribute('name', 'statusUpdate');
	statusBox.setAttribute('id', 'statusUpdate');
	$('#container').append(statusBox);

	//Creating a Post Status button
	var postButton = document.createElement('button');
	postButton.setAttribute('id', 'postButton');
	postButton.setAttribute('onclick', 'postStatusUpdate()');
	postButton.innerHTML = 'Post';
	$('#container').append(postButton);

	//Creating a logout button
	var logoutButton = document.createElement('button');
	logoutButton.setAttribute('id', 'loggerButton');
	logoutButton.setAttribute('onclick', 'logoutOfApp()');
	logoutButton.innerHTML = 'Logout';
	$('#container').append(logoutButton);
}

//Posts the status update to Facebook using a POST request
function postStatusUpdate() {
	var body = document.getElementById('statusUpdate').value;
	FB.api('/me/feed', 'post', { message: body }, function(response) {
	  	if (!response || response.error) {
	    	console.log('Error occured');
	  	} else {
	  		console.log('Posted status update: ' + body);
	    	console.log('Post ID: ' + response.id);
	  	}
	});
}

//Logs the user in to the app when the login button is clicked
function loginToApp() {
	FB.login(function(response) {
		if (response.authResponse) {
			// The person logged into your app
		} else {
			// The person cancelled the login dialog
			console.log('User cancelled connection.');
		}
	}, {scope: 'publish_actions, read_stream, user_photos, user_friends, friends_photos'});
}

//Logs the user out of the app when the logout button is called
function logoutOfApp() {
	console.log('logoutOfApp was called');
	document.location.href = document.URL + 'logout.html';
}
