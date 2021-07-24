// the form ID we're going to use to grab data from.
// you can repurpose this with your own form later on.
const Form = FormApp.openById("");
// the ID of the shared drive to target
const SharedDrive = DriveApp.getFolderById("");

// Turns the form response into a JS Object.
// this only takes the most recent form response.
// https://stackoverflow.com/questions/56093910/get-value-for-specific-question-item-in-a-google-form-using-google-app-script-in
function objectifyForm() {
  let formResponses = Form.getResponses();
  let currentResponse = formResponses[formResponses.length-1];
  let responseArray = currentResponse.getItemResponses();
  let form = {};
  form.user = currentResponse.getRespondentEmail(); //requires collect email addresses to be turned on or is undefined.
  form.timestamp = currentResponse.getTimestamp();
  form.formName = Form.getTitle();
  for (let i = 0; i < responseArray.length; i++){
    let response = responseArray[i].getResponse();
    var item = responseArray[i].getItem().getTitle();
    var item = camelize(item);
    form[item] = response;
  }
  return form;
}

// Makes strings format in camelCase 
// https://stackoverflow.com/questions/56093910/get-value-for-specific-question-item-in-a-google-form-using-google-app-script-in
function camelize(str) {
  str = str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '')
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * Invocates when the form is submitted. 
 * Do not put unnecessary complex logic here, if anything, use a proper function or make another file with the functions.
 */
function onSubmitForm() {
  let form = objectifyForm();
  let folderNameArray = [];
  let osuUserName = form.yourOsuUsername;
  let targetEmail = form.user;

  // check if this person was already enrolled
  let sharedDriveContents = SharedDrive.getFolders();

  while (sharedDriveContents.hasNext()) {
    let folder = sharedDriveContents.next();
    let folderName  = folder.getName();

    folderNameArray.push(folderName);
  }

  if (!folderNameArray.includes(osuUserName)) {
    // create folder then add person as editor.
    try {
       SharedDrive.createFolder(osuUserName);
       SharedDrive.addEditor(targetEmail);
       console.log(`Successfully onboarded ${osuUserName}@${targetEmail}.`)
    } catch (err) {
       console.error(`Failed to add ${osuUserName}@${targetEmail}.\n\n${err}`);
    }
  } else console.log(`${osuUserName} already exists! Skipping creation.`);
}
