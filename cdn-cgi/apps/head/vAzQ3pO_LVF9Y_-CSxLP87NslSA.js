;window.CloudflareApps=window.Eager=window.CloudflareApps||window.Eager||{};window.CloudflareApps=window.CloudflareApps||{};CloudflareApps.siteId="00dcfd3ad16284d35a03e37e9f345fd9";CloudflareApps.installs=CloudflareApps.installs||{};;(function(){CloudflareApps.internal=CloudflareApps.internal||{};var errors=[];CloudflareApps.internal.placementErrors=errors;var errorHashes={}
var noteError=function(options){var hash=options.selector+'::'+options.type+'::'+(options.installId||'');if(errorHashes[hash])
return;errorHashes[hash]=true;errors.push(options);}
var initializedSelectors={};var currentInit=false;CloudflareApps.internal.markSelectors=function(){if(!currentInit){check();currentInit=true;setTimeout(function(){currentInit=false;});}}
var check=function(){var installs=window.CloudflareApps.installs;for(var installId in installs){if(!installs.hasOwnProperty(installId))
continue;var selectors=installs[installId].selectors;if(!selectors)
continue;for(var key in selectors){if(!selectors.hasOwnProperty(key))
continue;var hash=installId+"::"+key;if(initializedSelectors[hash])
continue;var els=document.querySelectorAll(selectors[key]);if(els&&els.length>1){noteError({type:'init:too-many',option:key,selector:selectors[key],installId:installId});initializedSelectors[hash]=true;continue;}else if(!els||!els.length){continue;}
initializedSelectors[hash]=true;els[0].setAttribute('cfapps-selector',selectors[key]);}}}
CloudflareApps.querySelector=function(selector){if(selector==='body'||selector==='head'){return document[selector];}
CloudflareApps.internal.markSelectors();var els=document.querySelectorAll('[cfapps-selector="'+selector+'"]');if(!els||!els.length){noteError({type:'select:not-found:by-attribute',selector:selector});els=document.querySelectorAll(selector);if(!els||!els.length){noteError({type:'select:not-found:by-query',selector:selector});return null;}else if(els.length>1){noteError({type:'select:too-many:by-query',selector:selector});}
return els[0];}
if(els.length>1){noteError({type:'select:too-many:by-attribute',selector:selector});}
return els[0];}})();;(function(){var prevEls={};CloudflareApps.createElement=function(options,prevEl){CloudflareApps.internal.markSelectors();try{if(prevEl&&prevEl.parentNode){var replacedEl;if(prevEl.cfAppsElementId){replacedEl=prevEls[prevEl.cfAppsElementId];}
if(replacedEl){prevEl.parentNode.replaceChild(replacedEl,prevEl);delete prevEls[prevEl.cfAppsElementId];}else{prevEl.parentNode.removeChild(prevEl);}}
var element=document.createElement('cloudflare-app');var container;try{container=CloudflareApps.querySelector(options.selector);}catch(e){}
if(!container){return element;}
if(!container.parentNode&&(options.method=="after"||options.method=="before"||options.method=="replace")){return element;}
if(container==document.body){if(options.method=="after")
options.method="append";else if(options.method=="before")
options.method="prepend";}
switch(options.method){case"prepend":if(container.firstChild){container.insertBefore(element,container.firstChild);break;}
case"append":container.appendChild(element);break;case"after":if(container.nextSibling){container.parentNode.insertBefore(element,container.nextSibling);}else{container.parentNode.appendChild(element);}
break;case"before":container.parentNode.insertBefore(element,container);break;case"replace":try{id=element.cfAppsElementId=Math.random().toString(36);prevEls[id]=container;}catch(e){}
container.parentNode.replaceChild(element,container);}
return element;}catch(e){if(typeof console!=="undefined"&&typeof console.error!=="undefined"){console.error("Error creating Cloudflare Apps element",e);}}}})();;(function(){CloudflareApps.matchPage=function(patterns){if(!patterns||!patterns.length){return true;}
if(window.CloudflareApps&&CloudflareApps.proxy&&CloudflareApps.proxy.originalURL){var url=CloudflareApps.proxy.originalURL.parsed;var loc=url.host+url.path;}else{var loc=document.location.host+document.location.pathname;}
for(var i=0;i<patterns.length;i++){var re=new RegExp(patterns[i],'i');if(re.test(loc)){return true;}}
return false;}})();;CloudflareApps.installs["BRQuHKLaKFqv"]={appId:"W-bXB8WgEtY2",scope:{}};;CloudflareApps.installs["BRQuHKLaKFqv"].options={"account":{"accountId":"Ob71I__SFtGG","service":"drift-chat"},"activeColor":"#0176FF","autoOpen":false,"awayMessage":"We are currently offline, you can leave a message \u0026 we will get back to as soon as possible","backgroundColor":"#6b54bd","embedId":"hbennzb8fbz7","foregroundColor":"#FFFFFF","orgName":"Revox","welcomeMessage":"Need help with something? Leave us a message and we’ll follow up as soon as we can."};;CloudflareApps.installs["BRQuHKLaKFqv"].product={"id":"drift-free"};;CloudflareApps.installs["lXpDjxsLMpey"]={appId:"lMxPPXVOqmoE",scope:{}};;CloudflareApps.installs["lXpDjxsLMpey"].options={"id":"UA-56895490-1"};;if(CloudflareApps.matchPage(CloudflareApps.installs['BRQuHKLaKFqv'].URLPatterns)){'use strict';(function(){var defaultOptions={'orgName':'Your Company','activeColor':'#2d88f3','backgroundColor':'#2d88f3','foregroundColor':'#ffffff','welcomeMessage':'Thank you for visiting! How can I help?','awayMessage':'We’re not currently online right now but if you leave a message, we’ll get back to you as soon as possible!','autoOpen':false}
var getOptions=function(obj){for(var prop in obj){if(obj.hasOwnProperty(prop))
return false;}
var isEmpty=JSON.stringify(obj)===JSON.stringify({});return isEmpty?defaultOptions:CloudflareApps.installs['BRQuHKLaKFqv'].options}
var config={};var options=getOptions();var isPreview="BRQuHKLaKFqv"=="preview";if(isPreview&&(!options||!options.embedId))
options.embedId="f6r6234aekhz";if(!options||!options.embedId){return;}
var loadConfiguration=function(cb){var embedId=options.embedId||"f6r6234aekhz";var xhr=new XMLHttpRequest;xhr.open('GET',"https://customer.api.drift.com/embeds/"+embedId,true);xhr.onload=function(){var response=JSON.parse(xhr.response);response.configuration&&cb(response.configuration);};xhr.onerror=function(err){console.error("Error loading drift config",err);};xhr.send();}
var writeConfig=function(){if(config&&window.drift&&window.drift.config){drift.config(config);if(options.autoOpen)
drift.api.showWelcomeMessage()}}
CloudflareApps.installs['BRQuHKLaKFqv'].scope.setOptions=function(opts){var ensureHex=function(color){if(!color)return'#fff'
var isValid=color[0]==='#'
var updatedString='#'+color
return isValid?color:updatedString}
options=opts;config.backgroundColor=ensureHex(options.backgroundColor);config.foregroundColor=ensureHex(options.foregroundColor);config.activeColor=ensureHex(options.activeColor);config.messages=config.messages||{}
config.messages.welcomeMessage=(!!options.welcomeMessage&&options.welcomeMessage.length)?options.welcomeMessage:" ";config.messages.awayMessage=(!!options.awayMessage&&options.awayMessage.length)?options.awayMessage:" ";config.autoAssignee=config.autoAssignee||{};config.autoAssignee.name=options.orgName;config.enableWelcomeMessage=options.autoOpen;writeConfig()}
CloudflareApps.installs['BRQuHKLaKFqv'].scope.updateConfig=function(){loadConfiguration(function(conf){config=conf;});}
CloudflareApps.installs['BRQuHKLaKFqv'].scope.updateConfig();!function(){var driftt=window.driftt=window.drift=window.driftt||[];if(driftt.init){return;}
if(driftt.invoked){if(window.console&&console.error){console.error('Drift snippet included twice.');}
return;}
driftt.invoked=true;driftt.methods=['identify','config','track','reset','debug','show','ping','page','hide','off','on'];driftt.factory=function(method){return function(){var args=Array.prototype.slice.call(arguments);args.unshift(method);driftt.push(args);return driftt;};};driftt.methods.forEach(function(key){driftt[key]=driftt.factory(key);});return driftt.load=function(embedId){var REFRESH_RATE=300000;var timeHash=Math.ceil(new Date()/REFRESH_RATE)*REFRESH_RATE;var script=document.createElement('script');script.type='text/javascript';script.async=true;script.crossorigin='anonymous';script.src='https://js.driftt.com/include/'+timeHash+'/'+embedId+'.js';var first=document.getElementsByTagName('script')[0];first.parentNode.insertBefore(script,first);};}();drift.SNIPPET_VERSION='0.3.1';drift.on('ready',function(){CloudflareApps.installs['BRQuHKLaKFqv'].scope.setOptions&&CloudflareApps.installs['BRQuHKLaKFqv'].scope.setOptions(options)});drift.load(options.embedId);})();};if(CloudflareApps.matchPage(CloudflareApps.installs['lXpDjxsLMpey'].URLPatterns)){(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');};if(CloudflareApps.matchPage(CloudflareApps.installs['lXpDjxsLMpey'].URLPatterns)){(function(){var options=CloudflareApps.installs['lXpDjxsLMpey'].options
if(!options.id)return
window.ga('create',options.id,'auto')
window.ga('send','pageview')
if(options.social){(function(b){(function(a){"__CF"in b&&"DJS"in b.__CF?b.__CF.DJS.push(a):"addEventListener"in b?b.addEventListener("load",a,!1):b.attachEvent("onload",a)})(function(){"FB"in b&&"Event"in FB&&"subscribe"in FB.Event&&(FB.Event.subscribe("edge.create",function(a){_gaq.push(["_trackSocial","facebook","like",a])}),FB.Event.subscribe("edge.remove",function(a){_gaq.push(["_trackSocial","facebook","unlike",a])}),FB.Event.subscribe("message.send",function(a){_gaq.push(["_trackSocial","facebook","send",a])}));"twttr"in b&&"events"in twttr&&"bind"in twttr.events&&twttr.events.bind("tweet",function(a){if(a){var b;if(a.target&&a.target.nodeName=="IFRAME")a:{if(a=a.target.src){a=a.split("#")[0].match(/[^?=&]+=([^&]*)?/g);b=0;for(var c;c=a[b];++b)if(c.indexOf("url")===0){b=unescape(c.split("=")[1]);break a}}b=void 0}_gaq.push(["_trackSocial","twitter","tweet",b])}})})})(window);}}())}