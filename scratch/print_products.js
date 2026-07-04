const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAzt6_1j4xoiWP2tse8NrrLnwYprq9VOM0",
  authDomain: "kitkart-376e8.firebaseapp.com",
  projectId: "kitkart-376e8",
  storageBucket: "kitkart-376e8.firebasestorage.app",
  messagingSenderId: "714607733942",
  appId: "1:714607733942:web:d8cc758c8ae91fb6984a17",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`Product: ${data.name}`);
    console.log(`- Image: ${data.image ? data.image.substring(0, 80) + '...' : 'none'}`);
    console.log(`- MainImage: ${data.mainImage ? data.mainImage.substring(0, 80) + '...' : 'none'}`);
  });
}

run();
