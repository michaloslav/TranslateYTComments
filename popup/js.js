const apiKey = ""

function updateOnOffSwitchUI(){
  if(isOn){
    $("#onOffSwitch").html("Turn off")
    $("#onOffSwitch").removeClass("is-success")
    $("#onOffSwitch").addClass("is-danger")
  }
  else{
    $("#onOffSwitch").html("Turn on")
    $("#onOffSwitch").removeClass("is-danger")
    $("#onOffSwitch").addClass("is-success")
  }
}

function showRefreshSpan(timeout = 5){
  $("#refreshSpan").show()
  if(timeout) setTimeout(() => {$("#refreshSpan").hide()}, timeout * 1000)
}

$(() => {

  // figure out if the user turned the extension off
  chrome.storage.sync.get("isOn", (result) => {
    isOn = result.isOn
    if(typeof isOn == "undefined") isOn = true // the extension is on by default

    updateOnOffSwitchUI()
  })

  // get the users language from the storage
  chrome.storage.sync.get("lang", (result) => {
    lang = result.lang
    if(typeof lang == "undefined") lang = "en" // English is the default
  })

  // get the list of supported languages
  $.ajax({
    url: `https://translate.yandex.net/api/v1.5/tr.json/getLangs?key=${apiKey}&ui=en`
  }).done(data => {

    let langsUnsorted = data.langs

    // sort the languages alphabetically (by the values, not the keys)
    let langs = []
    for(let el in langsUnsorted) langs.push([el, langsUnsorted[el]])
    langs.sort((a, b) => {
      let sortNames = [a[1], b[1]].sort()
      return sortNames[0] == a[1] ? -1 : 1
    })

    //console.log(langs);

    for(let i = 0; i < langs.length; i++){
      if(langs[i][0] == "en") continue // English is at the top, don't add it again
      $("#languageSelect").append(`<option value="${langs[i][0]}">${langs[i][1]}</option>`)
    }

    $("#languageSelect").val(lang)
  })

  $("#languageSelect").change(el => {

    let lang = el.target.value

    chrome.storage.sync.set({lang})

    chrome.runtime.sendMessage({type: "changedLanguage", lang})

    showRefreshSpan()
  })

  $("#onOffSwitch").click(() => {

    // flip the isOn
    isOn = !isOn

    updateOnOffSwitchUI()

    chrome.storage.sync.set({isOn})

    chrome.runtime.sendMessage({type: "onOffSwitch", isOn})

    // tell the user to refresh (only if they turned the translation off)
    if(!isOn) showRefreshSpan(false)
  })
})
