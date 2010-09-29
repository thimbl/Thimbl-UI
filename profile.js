onmessage = function (event) {

var plan = JSON.parse(event.data);

var profile = {

    'name' : plan.name,
    'avatar' : plan.avatar,
    'bio' : plan.bio,
    'website' : plan.properties.website,
    'email' : plan.properties.email,
    'mobile' : plan.properties.mobile
   
}

postMessage(JSON.stringify(profile));
close();

}
