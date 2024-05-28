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
    > <!-- Menu navegacao do lado esquerdo -->
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
    


    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
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
                  <q-btn :color="followedUsers[user.user] ? 'green' : 'grey'" icon="fa-solid fa-user-plus" size="sm" flat round @click="addFollower(user)"/>              
                </div>
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
import { onSnapshot, collection, addDoc, getDocs, query, doc, deleteDoc, where } from 'firebase/firestore'
import db from '../boot/firebase';


export default {
  setup () {
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const users = ref([])
    const currentUser = ref(JSON.parse(localStorage.getItem('user')))

    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'))
      users.value = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    watch(currentUser, fetchUsers, { immediate: true })

    const deleteUser = async (id) => {
      if (currentUser.value.tipo !== 1) {
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
      deleteUser,
      currentUser
      
    }
  },
  data() {
  return {
    followedUsers: {}
  }
},
created() {
  this.checkFollowStatus()
},
  methods:{
    async unfollow(unfollowedUser) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    const followCollectionRef = collection(db, 'follow')
    const q = query(followCollectionRef, where("following", "==", currentUser.user), where("follower", "==", unfollowedUser.user));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'follow', querySnapshot.docs[0].id);
      await deleteDoc(docRef);
      this.followedUsers[unfollowedUser.user] = false
    }
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    const user = JSON.parse(localStorage.getItem('user'))
    if (currentUser === null || user === null) {
      console.error('Current user or user is null')
      return
    }
    console.log('Current user:', currentUser)
    console.log('User:', user)

    const followCollectionRef = collection(db, 'follow')
    const q = query(followCollectionRef, where("following", "==", currentUser.user), where("follower", "==", user.user));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      console.error('User is already followed')
      return
    }

    const newFollowDoc = {
      following: currentUser.user,
      follower: user.user
    }
    console.log('New follow doc:', newFollowDoc)
    await addDoc(followCollectionRef, newFollowDoc)
    this.followedUsers[followedUser.user] = true
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