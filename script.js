//EXTEND WEB STORAGE TO SUPPORT JSON
Storage.prototype.setObject = function(key,value) {
    this.setItem(key, JSON.stringify(value));
}
Storage.prototype.getObject = function(key) {
    return this.getItem(key) && JSON.parse(this.getItem(key));
}

//SET LOADER
var setLoader = function(selector, size) {
    var loaderImage;
    if (size === 'small') {
        loaderImage = 'sLoader.gif';
    } else if (size === 'big') {
        loaderImage = 'bLoader.gif';
    } else if (size === 'tiny') {
        loaderImage = 'tLoader.gif';
    }
    var loaderText = '<img src="' + loaderImage + '" />'
    $(selector).empty().append(loaderText);
}

// RETRIEVE .PLAN FILE
var getPlan = function() {
    $.ajax({
                url: "profile.json",
                async: true,
                dataType: 'json',
                success: function(data) {
                    localStorage.setObject('plan', data);
                }
    });
}

// POSTS OBJECT

var posts = new Object();

posts.get = function() {

    getPlan();
        //global array to hold messages
var allMessages = [];

//sorting and displaying messages happens only after all ajax calls return or timeout
var getAllMessages = function() {

//sort messages by time--larger numbers come first
var compareValues = function(a,b) {
                   return (b.time - a.time);
               }

allMessages.sort(compareValues);

$ .each(allMessages, function(key, value){

    var time = new Date(value.time);

    var timeObject = {
        year : time.getFullYear(),
        month : time.getMonth(),
        day : time.getDate(),
        hour : time.getHours(),
        minute : time.getMinutes(),
        second : time.getSeconds()
    }

var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

timeObject.month = monthArray[timeObject.month];

var insertingText = "";

                   if (key == 0) {

                   insertingText = "<div class='post first'>";

                   } else {

                     insertingText = "<div class='post'>";

                   }

                   insertingText += "<a class='user'>" + value.nick + "</a>";
                   insertingText += "<span class='time'>" + timeObject.month + " " + timeObject.day + " " + timeObject.year;
                   insertingText += " " + timeObject.hour + ":" + timeObject.minute + "</span>";
                   insertingText += "<p class='text'>" + value.text + "</p></div>";
                   $('div#posts').append(insertingText);

});

}

$.ajax({

        url: "profile.json",
        async: true,
        dataType: 'json',
        success: function(data) {

            //counter and numberFollowing keep track of how many ajax requests are sent and returned; when they're equal the global message array is sorted
            //and displayed
            var counter = 0;
            var numberFollowing = data.following.length - 1;

            //a cookie returns the user name of the current user
           var myAddress = $.cookie("thimbl-user");

            for (i in data.following) {

                 var followingNick = data.following[i].nick;
                 var getNewJSON = "http://users.thimbl.net/profile?u=" + data.following[i].address;

                 $.ajax({ url : getNewJSON, dataType : 'jsonp', success : function(data) {

                    var followingName = data.name;

                    for (i in data.messages) {

                        //add the nickname of the author to each message before pushing
                        data.messages[i].nick = followingName;

                        //push those messages into the global array
                        allMessages.push(data.messages[i]);

                    }

                    for (i in data.replies) {

                        var obj = data.replies[i];

                        for (i in obj) {

                        //add the nickname of the author to each message before pushing
                        obj[i].nick = followingName;

                        //push those messages into the global array
                        allMessages.push(obj[i]);

                        }
                    }

                    if (counter == numberFollowing) {
                        getAllMessages();
                    }

                    counter++;

                   },
                   error : function() {

                       if (counter == numberFollowing) {
                        getAllMessages();

                    }
                       counter ++; }
                 }
                );

                }
        },
        error: function() {}

});

}
posts.set = function() {

    posts.get();
}

// PROFILE OBJECT

var profile = new Object();

profile.get = function() {
    
    getPlan();

    //create a worker to manipulate the profile
    var profileWorker = new Worker('profile.js');
    profileWorker.onmessage = function(event) {
        var profile = JSON.parse(event.data);
        $('thead tr th').html(profile.name);
        $('td#name').html(profile.name);
        $('td#bio').html(profile.bio);
        $('td#website').html('<a href="' + profile.website + '">' + profile.website + '</a>');
        $('td#email').html(profile.email);
        $('td#mobile').html(profile.mobile);
        $('#profile').prepend('<img src="' + profile.avatar + '" id="avatar" alt="' + profile.name + '" />');
    }
    profileWorker.postMessage(localStorage.getItem('plan'));

}
profile.set = function() {

   profile.get();

}

// FOLLOWING OBJECT

var following = new Object();

following.get = function() {

getPlan();

//create a worker to manipulate the profile
    var followingWorker = new Worker('following.js');
    followingWorker.onmessage = function(event) {
        var following = event.data;
        $('#sidebar').append(following);
    }
    followingWorker.postMessage(localStorage.getItem('plan'));


}

following.set = function() {

    following.get();
}

// REPLIES OBJECT

var replies= new Object();

replies.get = function() {
    getPlan();
    setLoader('#replies', 'tiny');
}
replies.set = function() {

    replies.get();
}


// BOOTSTRAP THE APP
(function(){
    profile.get();
    posts.get();
    following.get();
}());
