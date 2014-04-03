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
var pic_data = {"photos":{"next":null,"data":[],"num":0},"albums":{"next":null,"data":[],"num":0},"photos_tagged":{"next":null,"data":[],"num":0}}
var album_data = {}
//Renders the app when the user is logged in
function renderApp() {
	console.log('renderApp was called');

	//Removing Login Page elements
	$('body').removeClass('login_page');
	$('body').addClass('app_page');

	$('#loggerButton').remove();

	// var id = "/Sydney.Sprinkle";
	var id = "/Sydney.Sprinkle";
	$("#pic_container > div:not(#folders)").hide();
	$("#folders").append("<div class='innerfolder'><a onclick='showPics(\"photos\")'><img src='folder.png'>Photos</a></div>");
	$("#folders").append("<div class='innerfolder'><a  onclick='showPics(\"photos_tagged\")'><img src='folder.png'>Tagged Photos</a></div>");
	$("#folders").append("<div class='innerfolder'><a onclick='showPics(\"albums\")'><img src='folder.png'>Albums</a></div>");

	getAlbums(id,"albums");
	getPics(id,"photos");
	getPicsTagged(id,"photos_tagged");

}

function showPics(name){
	// alert(JSON.stringify(pic_data[name]));
	$("#pic_container > div").hide();
	$("#"+name).show();
	$("#"+name).parent().show();
}

function getAlbums(id,toAppend){
	// $("#albums").show();
	// $("#albums").append("<p>HIHIHIHIHIHIHI</p>");

	FB.api(id+'/albums', function(response) {
		console.log("!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!");
		console.log(response);
		console.log("!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!");
		var arr = response.data;
		var next = response.paging.next;
		pic_data.albums.next=next;
		$('#'+toAppend).append("<button class='loadMore' onclick='loadPosts(\"albums\")'>Load More</button>");
		for(var x in arr){
			pic_data.albums.data.push("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
			$('#'+toAppend).append("<div class='innerfolder'><a onclick='goToAlbum("+JSON.stringify(arr[x])+")'><img src='folder.png' data-all="+JSON.stringify(arr[x])+">"+arr[x].name+"</a></div>");
		}
	});
}

function goToAlbum(data) {
	$("#pic_container > div").hide();
	$("#albums").hide();
	$("#album_container").show();
	$("#individual_album").show();

	// alert(albumData);
	console.log(data);
	console.log(1);
	$("#individual_album").html("<p>No photos in this album</p>");
	console.log(2);
	
	if(album_data[data.name]==undefined){
		console.log(3);
	
		FB.api(data.id+'/photos', function(response) {
			console.log("HIHIHIHIHIHIHI");
			console.log(response);
			console.log("HIHIHIHIHIHIHI");
			var arr = response.data;
			var next = null;
			if(response.paging!=undefined){
				next = response.paging.next;
			}
			var obj = {"next":next,"pics":[]}
			$('#individual_album').empty();
			$('#individual_album').append("<button class='loadMore' onclick='loadAlbumPosts(\""+data.name+"\")'>Load More</button>");
			for(var x in arr){
				obj["pics"].push("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
				$('#individual_album').append("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
			}
			album_data[data.name]=obj;
		});
	}else{
		$('#individual_album').empty();
		$('#individual_album').append("<button class='loadMore' onclick='loadAlbumPosts(\""+data.name+"\")'>Load More</button>");	
		for(var x in album_data[data.name]["pics"]){
			$('#individual_album').append("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
		}

	}


}

function getPicsTagged(id,toAppend){
	FB.api(id+'/photos/uploaded', function(response) {
		console.log("*$*$*$*$*$*$*$*#*#*$*$*#*#*$*$*$*#**#**$");
		console.log(response);
		console.log("*$*$*$*$*$*$*$*#*#*$*$*#*#*$*$*$*#**#**$");
		if(response.data.length>0){
			var arr = response.data;
			var next = response.paging.next;
			pic_data.photos_tagged.next=next;
			$('#'+toAppend).append("<button class='loadMore' onclick='loadPosts(\"photos_tagged\")'>Load More</button>");
			for(var x in arr){
				pic_data.photos_tagged.data.push("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
				$('#'+toAppend).append("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
			}
		}else{
			$('#'+toAppend).append("<p>This user has not tagged any pictures</p>");
		}
	});
}

function getPics(id,toAppend) {
	FB.api(id+'/photos', function(response) {
		console.log("*#****************************");
		console.log(response);
		console.log("*FFF****************************");
		if(response.data.length>0){
			var arr = response.data;
			var next = response.paging.next;
			pic_data.photos.next=next;
			$('#'+toAppend).append("<button class='loadMore' onclick='loadPosts(\"photos\")'>Load More</button>");
			for(var x in arr){
				pic_data.photos.data.push("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
				$('#'+toAppend).append("<img src='"+arr[x].picture+"' data-all="+JSON.stringify(arr[x])+">");
			}
		}else{
			$('#'+toAppend).append("<p>No photos of this user</p>");
		}
	});
}

function loadAlbumPosts(toAppend){
	// alert(nextPage);
	// alert(JSON.stringify(pic_data));
	console.log(album_data);
	var nextPage = album_data[toAppend].next;
	// alert(toAppend);

	$.get(nextPage,function (response){
		console.log("!@!@!@!@!@!@!@!@!@!@!@!@!@");
		console.log(response);
		console.log("!@!@!@!@!@!@!@!@!@!@!@!@!@");
		for(var pic in response.data){
			album_data[toAppend]["pics"].push("<img src='"+response.data[pic].picture+"' data-all="+JSON.stringify(response.data[pic])+">");
			$("#individual_album").append("<img src='"+response.data[pic].picture+"' data-all="+response.data[pic]+">");
		}
		if(response.paging!=undefined && response.paging.next!=undefined){
			album_data[toAppend].next=response.paging.next;
			// $("#individual_album > .loadMore").show();
		}else{
			album_data[toAppend].next=null;
			$("#individual_album > .loadMore").html("DONENANANA");
		}
		
	},"json");
}

function loadPosts(toAppend){
	// alert(nextPage);
	// alert(JSON.stringify(pic_data));
	var nextPage = pic_data[toAppend].next;
	// alert(toAppend);
	console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
	console.log(pic_data);
	console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
	// alert($("container > img:first-child").attr("src"));
	$.get(nextPage,function (response){
		console.log("!@!@!@!@!@!@!@!@!@!@!@!@!@");
		console.log(response);
		console.log("!@!@!@!@!@!@!@!@!@!@!@!@!@");
		for(var pic in response.data){
			$("#"+toAppend).append("<img src='"+response.data[pic].picture+"' data-all="+response.data[pic]+">");
		}
		if(response.paging!=undefined){
			pic_data[toAppend].next=response.paging.next;
		}else{
			$("toAppend.loadMore").html("DONENANANA");
		}
		
	},"json");
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
