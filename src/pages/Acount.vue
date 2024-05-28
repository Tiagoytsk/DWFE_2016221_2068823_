<template>
  <div>
    <div v-if="isLogin && user">
      <p style="margin-left: 50px; margin-right: 50px; margin-top: 20px;">Welcome, {{ user.user }}!</p>
      <q-btn style="margin-left: 50px; margin-right: 50px; margin-top: 20px;" @click="logout" color="primary" >Logout</q-btn>
      
    </div>
    <div v-else>
      <q-btn style="margin-left: 50px; margin-right: 50px; margin-top: 20px;" @click="switchForm" color="primary" >
        Switch to {{ isLogin ? 'Register' : 'Login' }}
    </q-btn>

      <form v-if="isLogin" @submit.prevent="login">
        <h2 style="margin-left: 50px; margin-right: 50px;">Login</h2>
        <div style="margin-left: 50px; margin-right: 50px;">
          <label for="login-username">Username:</label>
          <q-input v-model="username" filled type="login-username" />
        </div>
        <div style="margin-left: 50px; margin-right: 50px;">
          <label for="login-password">Password:</label> 
          <q-input v-model="password" filled type="password"  />
        </div>
        <q-btn style="margin-left: 50px; margin-right: 50px; margin-top: 15px;" type="submit" color="primary">Login</q-btn>
      </form>

      <form v-else @submit.prevent="register">
        <h2 style="margin-left: 50px; margin-right: 50px;">Register</h2>
        <div style="margin-left: 50px; margin-right: 50px;">
          <label for="register-username">Username:</label>
          <q-input v-model="username" filled type="register-username" />
        </div>
        <div style="margin-left: 50px; margin-right: 50px;">
          <label for="register-password">Password:</label>
          <q-input id="register-password" v-model="password" filled type="password" />
        </div>
        <q-btn style="margin-left: 50px; margin-right: 50px; margin-top: 15px;" color="primary" type="submit">Register</q-btn>
      </form>

      <p style="margin-left: 50px; margin-right: 50px; color: red;" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref,onMounted } from 'vue';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABiJ04vycDfAsa9ZMmMumLYxrYSyOnnm4",
  authDomain: "twiter-dos-chinos-61bec.firebaseapp.com",
  projectId: "twiter-dos-chinos-61bec",
  storageBucket: "twiter-dos-chinos-61bec.appspot.com",
  messagingSenderId: "1000314959337",
  appId: "1:1000314959337:web:01bd8039103654f7124778"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const user = ref(null);
    const error = ref('');
    const isLogin = ref(true);

    const logout = () => {
      user.value = null;
      localStorage.removeItem('user');
      localStorage.removeItem('isLogin');
      localStorage.removeItem('userHasLiked');
    };

    const switchForm = () => {
      isLogin.value = !isLogin.value; // switch the form
    };
    const login = async () => {
      let userFound = false;
      try {
        const userQuerySnapshot = await getDocs(collection(db, 'users'));
        for (const doc of userQuerySnapshot.docs) {
          const userData = doc.data();
          if (userData.user === username.value && userData.pass === password.value) {
            user.value = userData;
            userFound = true;
            console.log('User logged in: ', user.value);
            localStorage.setItem('user', JSON.stringify(user.value));
            localStorage.setItem('isLogin', true);
            break;
          }
        }
        if (!userFound) {
          throw new Error('User not found or incorrect password');
        }
      } catch (err) {
        console.error('Error logging in: ', err);
        error.value = 'An error occurred while logging in.';
      }
    };

    const register = async () => {
      try {
        // Check if username already exists
        const userQuerySnapshot = await getDocs(collection(db, 'users'));
        for (const doc of userQuerySnapshot.docs) {
          const userData = doc.data();
          if (userData.user === username.value) {
            error.value = 'Username already exists';
            return;
          }
        }

        // Add new user to the database
        await addDoc(collection(db, 'users'), {
          user: username.value,
          pass: password.value,
          tipo: 0,
        });

        // Clear the form
        username.value = '';
        password.value = '';
      } catch (err) {
        console.error(err);
        error.value = 'Failed to register';
      }
    };

    const checkLogin = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const storedIsLogin = JSON.parse(localStorage.getItem('isLogin'));
      if (storedUser && storedIsLogin) {
        user.value = storedUser;
        isLogin.value = storedIsLogin;
      }
    };
    onMounted(checkLogin);

    return {
      username,
      password,
      user,
      error,
      isLogin,
      switchForm,
      checkLogin,
      login,
      register,
      logout
    };
  }
}
</script>