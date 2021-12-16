// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, query, orderBy, where, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, setPersistence, inMemoryPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7HIKBd08tjEHy__26_90KSR0N7QTrefg",
  authDomain: "gdsc-ncu-firebase-introduction.firebaseapp.com",
  projectId: "gdsc-ncu-firebase-introduction",
  storageBucket: "gdsc-ncu-firebase-introduction.appspot.com",
  messagingSenderId: "501819534244",
  appId: "1:501819534244:web:a4f5e37251ebcd9638af31",
  measurementId: "G-4DG2SLNJBB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();

window.logIn = async function logIn() {
  await setPersistence(auth, inMemoryPersistence)
    .then(() => {
      const provider = new GoogleAuthProvider();
      // In memory persistence will be applied to the signed in Google user
      // even though the persistence was set to 'none' and a page redirect
      // occurred.
      return (
        signInWithPopup(auth, provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            setCookie('username', result.user.displayName);
            setCookie('userPhotoURL', result.user.photoURL);
            setCookie('uid', result.user.uid);
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.error(error);
            // ...
          })
      );
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  if (getCookie('username') != '') {
    document.getElementById('accountDisplay').innerHTML =
      `<a href="./person.html" class="flex items-center">
      <img src = "${getCookie('userPhotoURL')}"
        class="h-8 w-8 rounded-full" >
      <div class="ml-3">${getCookie('username')}</div>
      </a>
      <div class="ml-3" onclick="logOut()">log out</div>`;
    // Simulate a mouse click:
    window.location.href = `${window.location.href}`;
  }
}

// google popup window login
if (getCookie('username') !== '') {
  document.getElementById('accountDisplay').innerHTML =
    `<a href="./person.html" class="flex items-center">
      <img src = "${getCookie('userPhotoURL')}"
        class="h-8 w-8 rounded-full" >
      <div class="ml-3">${getCookie('username')}</div>
    </a>
    <div class="ml-3 cursor-pointer" onclick="logOut()">log out</div>`;
}

window.logOut = function logOut() {
  deleteCookie('username');
  deleteCookie('userPhotoURL');
  deleteCookie('uid');
  document.getElementById('accountDisplay').innerHTML = '<div class="ml-3" onclick="logIn()">log in</div>';
  signOut(auth).then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
  // Simulate a mouse click:
  window.location.href = `${window.location.href}`;
}

window.addNewPost = async function addNewPost(post) {
  if (getCookie('username') == '') {
    await logIn();
  }
  if (getCookie('username') != '') {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        userPhotoURL: getCookie('userPhotoURL'),
        username: getCookie('username'),
        author_uid: getCookie('uid'),
        post: post,
        createAt: new Date()
      });
      console.log("Document written with ID: ", docRef.id);
      // Simulate a mouse click:
      window.location.href = "./index.html";
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  } else {
    document.getElementById('warning').innerText = 'Please Log In To Summit Your Posts';
  }
}

window.getPersonPosts = async function getPersonPosts(personTimeLine) {
  if (getCookie('username') !== '') {
    try {
      const username = getCookie('username');
      const userPhotoURL = getCookie('userPhotoURL');
      document.getElementById('personName').innerText = username;
      document.getElementById('personPhoto').src = userPhotoURL;
      const q = await query(collection(db, "posts"), where("username", "==", username), orderBy("createAt", "desc"));
      const querySnapshot = await getDocs(q);
      personTimeLine.innerHTML = "";
      querySnapshot.forEach((doc) => {
        var date = new Date(doc.data().createAt.seconds * 1000);
        var years = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hours = date.getHours();
        var min = date.getMinutes();
        var formattedTime = `${years}-${month}-${day} ${hours}:${min}`;
        var deleteButton = '';
        var postId = '';
        if (doc.data().username == getCookie('username')) {
          postId = doc.id;
          deleteButton = `<div id='${postId}' onClick='deletePost(this.id)' class='cursor-pointer text-sm text-yellow-400 border border-yellow-400 rounded-xl w-min px-2'>Delete</div>`
        }
        personTimeLine.innerHTML = `${personTimeLine.innerHTML}
        <div id='post:${postId}' class='my-5 pb-2 border-b border-gray-500 border-opacity-70'>
          <div class='flex items-center justify-between pb-2'>
            <div class='flex items-center'>
              <img src='${doc.data().userPhotoURL}' class='h-10 w-10 rounded-full'>
              <div class='p-2 text-2xl'>
                ${doc.data().username}
                <div class='text-xs text-gray-400'>at ${formattedTime}</div>
              </div>
              </div>
            ${deleteButton}
          </div>
          <div class='break-words'>
            <pre>${hasHtmlTags(doc.data().post)}</pre>
          </div>
        </div>`;
      });
    } catch (e) {
      console.error("Error reading document: ", e);
    }
  } else {
    document.getElementById('personName').innerText = 'You Must Login first :)';
    document.getElementById('personPhoto').src = 'http://www.brainlesstales.com/images/2010/Mar/login.jpg';
  }
}

window.getPosts = async function getPosts(postTimeLine) {
  try {
    const q = await query(collection(db, "posts"), orderBy("createAt", "desc"));
    const querySnapshot = await getDocs(q);
    postTimeLine.innerHTML = "";
    querySnapshot.forEach((doc) => {
      var date = new Date(doc.data().createAt.seconds * 1000);
      var years = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();
      var hours = date.getHours();
      var min = date.getMinutes();
      var formattedTime = `${years}-${month}-${day} ${hours}:${min}`;
      var deleteButton = '';
      var postId = '';
      if (doc.data().username == getCookie('username')) {
        postId = doc.id;
        deleteButton = `<div id='${postId}' onClick='deletePost(this.id)' class='cursor-pointer text-sm text-yellow-400 border border-yellow-400 rounded-xl w-min px-2'>Delete</div>`
      }
      postTimeLine.innerHTML = `${postTimeLine.innerHTML}
          <div id='post:${postId}' class='my-5 pb-2 border-b border-gray-500 border-opacity-70'>
            <div class='flex items-center justify-between pb-2'>
              <div class='flex items-center'>
                <img src='${doc.data().userPhotoURL}' class='h-10 w-10 rounded-full'>
                <div class='p-2 text-2xl'>
                  ${doc.data().username}
                  <div class='text-xs text-gray-400'>at ${formattedTime}</div>
                </div>
                </div>
              ${deleteButton}
            </div>
            <div class='break-words'>
              <pre>${removeHtmlTags(doc.data().post)}</pre>
            </div>
          </div>`;
    });
  } catch (e) {
    console.error("Error reading document: ", e);
  }
}

window.deletePost = async function deletePost(PostId) {
  await deleteDoc(doc(db, "posts", PostId));
  const postElement = document.getElementById(`post:${PostId}`);
  postElement.innerHTML = '';
  postElement.classList = [];
}

function setCookie(cname, dataString) {
  const d = new Date();
  d.setTime(d.getTime() + (1 * 60 * 60 * 1000)); // 1hr
  const expires = `expires=${d.toUTCString()};`;
  document.cookie = `${cname}=${dataString}; ${expires} path=/;`;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function deleteCookie(cname) {
  document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function removeHtmlTags(string) {
  var pattern = /<(.*)>/;
  if (pattern.test(string)) {
    var result = '';
    for (var i = 0; i < string.length; i++) {
      console.log(string[i]);
      if (string[i] == '<' || string[i] == '>') {
        result = `${result}`;
      } else if (string[i] == '&') {
        result = `${result}&amp;`;
      } else if (string[i] == `"`) {
        result = `${result}&quot;`;
      } else if (string[i] == `'`) {
        result = `${result}&#x27;`;
      } else if (string[i] == `/`) {
        result = `${result}/;`;
      } else {
        result = `${result}${string[i]}`;
      }
    }
    return `我就爛👍 ${result}`;
  } else {
    return string;
  }
}