<template>
  <q-layout view="lHr lpR fff">

    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
         <span class="gt-sm">{{ $route.name }}</span>
         <q-icon 
      class="header-icon q-pa-md lt-md"
      name="fa-solid fa-skull-crossbones" 
      size="sm"
      color="primary"
      />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer 
    show-if-above 
    v-model="leftDrawerOpen" 
    :width="283"
    side="left" 
    bordered
    >
      <q-icon 
      class="q-ma-md"
      name="fa-solid fa-skull-crossbones" 
      size="lg"
      color="primary"
      />
      <q-list>
      <q-item 
      to="/"
      clickable 
      v-ripple
      >
        <q-item-section avatar>
          <q-icon  name="home" size="md"  />
        </q-item-section>

        <q-item-section class="text-h6 text-weight-bold">Home</q-item-section>
      </q-item>
      <q-item 
      to="/about"
      clickable 
      v-ripple
      exact
      >
        <q-item-section avatar>
          <q-icon  name="help" size="md"  />
        </q-item-section>

        <q-item-section class="text-h6 text-weight-bold">About</q-item-section>
      </q-item>
      <q-item 
      to="/acount"
      clickable 
      v-ripple
      exact
      >
        <q-item-section avatar>
          <q-icon 
      name="fa-solid fa-user" 
      size="sm"
      />
        </q-item-section>

        <q-item-section class="text-h6 text-weight-bold">Acount</q-item-section>
      </q-item>
      </q-list>
    </q-drawer>
    


    <q-drawer show-if-above v-model="rightDrawerOpen" :width="283" side="right" bordered>
      <q-input 
      placeholders="Search skukl"
      class="q-ma-md"
      outlined
      rounded
      dense>
        <template v-slot:prepend>
        <q-icon name="search"></q-icon>
        </template>
      </q-input>
      <q-list separator padding>
        <q-item class="q-pa-md" v-for="(user, index) in users" :key="index">
          <q-item-section>
            <q-btn v-if="currentUser.tipo===1" flat round dense icon="delete" @click="deleteUser(user.id)" />
            <div class="q-pa-md example-row-equal-width">

              <div class="row">
                <div class="col">
                  <q-item-label overline class="text-grey">{{ user.user }}</q-item-label>

                </div>
                <div class="col">
                  <q-btn :color="isFollowing[user.user] ? 'green' : 'grey'" icon="fa-solid fa-user-plus" size="sm" flat round @click="addFollower(user.user)"/>                </div>
            </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref, watch } from 'vue'

import { onSnapshot, collection, addDoc, getDocs, query, doc, deleteDoc, where , serverTimestamp} from 'firebase/firestore'
import db from '../boot/firebase';


export default {
  watch: {
    currentUser() {
      this.$forceUpdate();
    },
  },
  setup () {
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }
    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value
    }

    const users = ref([])
    const currentUser = ref(JSON.parse(localStorage.getItem('user')))

    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'))
      users.value = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    watch(currentUser, fetchUsers, { immediate: true })

    const deleteUser = async (id) => {
  if (currentUser.value && currentUser.value.tipo === '1') {
    // if the current user's tipo is not 1, don't delete the user
    return
  }

  const userRef = doc(db, 'users', id)
  await deleteDoc(userRef)
}


    return {
      leftDrawerOpen,
      rightDrawerOpen,
      users,
      toggleLeftDrawer,
      toggleRightDrawer,
      deleteUser,
      currentUser
      
    }
  },
  data() {
  return {
    followedUsers: {},
    isFollowing: {},
  }
},

created() {
  this.checkFollowStatus()
},
created() {
  this.isFollowing = JSON.parse(localStorage.getItem('isFollowing')) || {};
  this.checkFollowStatus();
},
  methods:{
    async unfollow(userToUnfollow) {
    // Check if the current user is following the userToUnfollow
    if (this.followingUsers[userToUnfollow.id]) {
      // Remove userToUnfollow from the followingUsers list
      delete this.followingUsers[userToUnfollow.id];

      // Update the followingUsers list in the database
      const userRef = doc(db, 'users', this.currentUser.id);
      await updateDoc(userRef, {
        following: this.followingUsers
      });
    }
  },
  async created() {
  const currentUser = this.currentUser; // Assuming currentUser is defined in your component
  const followedUser = this.followedUser; // Assuming followedUser is defined in your component

  const followCollectionRef = collection(db, 'follow')
  const q = query(followCollectionRef, where("following", "==", currentUser.user), where("follower", "==", followedUser));
  const querySnapshot = await getDocs(q);
  this.isFollowing = !querySnapshot.empty;
},
    async checkFollowStatus() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  for (let user of this.users) {
    const followCollectionRef = collection(db, 'follow')
    const q = query(followCollectionRef, where("following", "==", currentUser.user), where("follower", "==", user.user));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      this.followedUsers[user.user] = true
    }
  }
},
async addFollower(followedUser) {
  const currentUser = this.currentUser; // Assuming currentUser is defined in your component

  if (!currentUser || !followedUser) {
    console.error('Current user or followed user is null')
    return
}

const followCollectionRef = collection(db, 'follow')
const q = query(followCollectionRef, where("following", "==", currentUser.user), where("follower", "==", followedUser));
const querySnapshot = await getDocs(q);
if (!querySnapshot.empty) {
  let newFollowDoc = {
    followerId: this.currentUser.id,
    followedId: followedUser.id,
    timestamp: serverTimestamp()
  };
    // User is already followed, so unfollow
    await addDoc(followCollectionRef, newFollowDoc)
  this.isFollowing[followedUser] = true;
  console.log('User is now followed')
    this.isFollowing[followedUser] = false;
    console.log('User is now unfollowed')
  } else {
    
    await addDoc(followCollectionRef, newFollowDoc)
    this.isFollowing[followedUser] = true;
    console.log('User is now followed')
  }
  localStorage.setItem('isFollowing', JSON.stringify(this.isFollowing));


const newFollowDoc = {
    following: currentUser.user,
    follower: followedUser
}

// Add the new follower document to the follow collection
await addDoc(followCollectionRef, newFollowDoc)
  this.isFollowing[followedUser] = true;
  console.log('User is now followed')
}
  }
}
</script>

<style>
.header-icon {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>