onmessage = function (event) {

var plan = JSON.parse(event.data);

var following = plan.following;

var followingText = '';

for (i in following) {
    followingText += '<li><p class="name">' + following[i].nick + '</p><p class="address"> ' + following[i].address + '</p></li>';
}

postMessage(followingText);
close();

}
