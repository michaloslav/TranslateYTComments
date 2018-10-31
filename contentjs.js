loadedCommentsLength = 0
const apiKey = "trnsl.1.1.20181014T154414Z.4c9d371bd9b274fa.8ba93ab6094c8bf18ec91a6d9a1d801dba5de577"

function findAllComments(){
  return $("ytd-comment-thread-renderer ytd-expander #content-text").toArray()//.map((el) => {return el.innerText})
}

function translateAllComments(comments = findAllComments()){
  comments.forEach((el, i) => {
    $.ajax({
      url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
      data: {
        key: apiKey,
        text: el.innerHTML,
        lang,
        format: "html"
      }
    }).done(data => {
      //console.log(data.text[0]);
      //console.log(data);

      var selector = $("ytd-comment-thread-renderer ytd-expander #content-text").toArray()[i]
      $(selector).html(data.text[0])
    })
  })
}

function checkForNewComments(){
  //console.log("checking");
  let comments = findAllComments()

  if(comments.length != loadedCommentsLength){
    loadedCommentsLength = comments.length
    //console.log("found");

    translateAllComments(comments)
  }
}

$(() => {

  // figure out if the user turned the extension off
  chrome.storage.sync.get("isOn", (result) => {
    isOn = result.isOn
    if(typeof isOn == "undefined") isOn = true // the extension is on by default

    // start the actual translation
    if(isOn) interval = setInterval(checkForNewComments, 200) // check every x ms
  })

  // get the users language from the storage
  chrome.storage.sync.get("lang", (result) => {
    lang = result.lang
    if(typeof lang == "undefined") lang = "en" // English is the default
  })

  // if the user changes the settings in the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.type){
      case "onOffSwitch":
        isOn = message.isOn

        // if it was off before and the user just turned it on, translate the comments
        if(isOn) translateAllComments()

        break
      case "changedLanguage":
        lang = message.lang

        translateAllComments()

        break
    }
  })
})
