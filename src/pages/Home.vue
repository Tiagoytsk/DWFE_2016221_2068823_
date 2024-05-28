<template>
  <q-page >
    <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
      <div class="col">
        <q-input class="newtweet" autogrow  v-model="newTweetContent" placeholder="What's happening?"  maxlength="280" bottom-slots counter>
        <template v-slot:before>
          <q-avatar size="xl">
            <img src="https://cdn.quasar.dev/img/avatar5.jpg" alt="">
          </q-avatar>
        </template>

      </q-input>
      </div>
      <div class="col col-shrink">
        <q-btn class="q-mb-lg"
          @click="newtweet"
         :disable="!newTweetContent"
          unelevated 
          rounded 
          color="primary" 
          label="Tweet" 
          no-caps></q-btn>
      </div>
    </div>

    <q-separator class="divider" size="10px" color="grey-2"></q-separator>
  
    <q-list separator>
      <q-item class="q-py-md" v-for="tweet in tweets" :key="tweet.date">
        <q-item-section avatar top>
          <q-avatar size="xl">
            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-subtitle1"> 
            <strong>{{ tweet.user }}</strong> 
            <span class="text-grey-7"> @{{ tweet.user }}</span>
          </q-item-label>
          <q-item-label class="tweet-content">
            <span class="text-weight-bold text-body1"></span>
           {{ tweet.content }}
          </q-item-label>
          <div class="row justify-between q-mt-sm">
            <q-btn color="grey" icon="far fa-comment" size="sm" flat round />
            <q-btn color="grey" icon="fas fa-retweet" size="sm" flat round />
            <q-btn 
  @click="like(tweet.id)" 
  :icon="userHasLiked[tweet.id] ? 'fas fa-heart' : 'far fa-heart'" 
  :color="userHasLiked[tweet.id] ? 'pink' : 'grey'" 
  size="sm" 
  flat 
  round
>
  {{ likesCount[tweet.id] || 0 }} 
</q-btn>           
            <q-btn @click="deletetweet(tweet)" color="grey" icon="fas fa-trash" size="sm" flat round />
          </div>
        </q-item-section>

        <q-item-section side top>
          {{ relativeDate(tweet.date) }}
        </q-item-section>
      </q-item>

      <q-separator inset="item" />
    </q-list>
  </q-page>
</template>

<script>
import db from 'src/boot/firebase';
import { formatDistance } from 'date-fns';
import { ref } from 'vue';
import * as firebase from 'firebase/app';
import { collection, addDoc, query, getDocs, doc, deleteDoc, where, orderBy } from 'firebase/firestore';

export default {
  name: 'Home',
  data() {
    return {
      newTweetContent: '',
      tweets:[],
      tweet_id: '',
      likesCount: {},
      likedTweets: {},
      userHasLiked: {},
      userHasLiked: JSON.parse(localStorage.getItem('userHasLiked')) || {},
    }
  },
  watch: {
    userHasLiked: {
      handler(newValue) {
        localStorage.setItem('userHasLiked', JSON.stringify(newValue));
      },
      deep: true,
    },
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    const user_id = user.user;

    if (!localStorage.getItem('userHasLiked')) {
      const tweetsSnapshot = await getDocs(collection(db, 'tweets'));
      for (let doc of tweetsSnapshot.docs) {
        this.tweets.push(doc.data());
        await this.getLikesCount(doc.id);
        await this.checkUserHasLiked(doc.id, user_id);
      }
    }
  },
  methods:{
    async checkUserHasLiked(tweet_id, user_id) {
      const q = query(
        collection(db, 'likes'),
        where('tweet_id', '==', tweet_id),
        where('user_id', '==', user_id)
      );
      const querySnapshot = await getDocs(q);
      this.userHasLiked[tweet_id] = !querySnapshot.empty;
    },
    async getLikesCount(tweet_id) {
      const q = query(
        collection(db, 'likes'),
        where('tweet_id', '==', tweet_id)
      );
      const querySnapshot = await getDocs(q);
      this.likesCount[tweet_id] = querySnapshot.size;
    },
    async like(tweet_id) {
      try {
        // Retrieve user data from localStorage and parse it
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
          console.error('No user found in localStorage');
          return;
        }

        // Use the 'user' field as the user_id
        const user_id = user.user;

        await this.checkUserHasLiked(tweet_id, user_id);

        if (this.userHasLiked[tweet_id]) {
          // The user has already liked this tweet, so unlike it.
          const q = query(
            collection(db, 'likes'),
            where('tweet_id', '==', tweet_id),
            where('user_id', '==', user_id)
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
          this.userHasLiked[tweet_id] = false;
        } else {
          // The tweet is not liked by the user, so add the like.
          await addDoc(collection(db, 'likes'), {
            tweet_id: tweet_id,
            user_id: user_id
          });
          this.userHasLiked[tweet_id] = true;
        }
        await this.getLikesCount(tweet_id);
      } catch (error) {
        console.error(error);
      }
    },
    async countLikes(tweet_id) {
      const q = query(
        collection(db, 'likes'),
        where('tweet_id', '==', tweet_id)
      );
      const querySnapshot = await getDocs(q);
      this.likesCount[tweet_id] = querySnapshot.size;
    },
    async newtweet(){
      let storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        alert('You must be logged in to tweet.');
        return;
      }
      let tweet = {
        content: this.newTweetContent,
        date: Date.now(),
        user: storedUser.user // Access the 'user' property of the storedUser object
      }
      const tweetCollection = collection(db, 'tweets');
      const docRef = await addDoc(tweetCollection, tweet);
      tweet.id = docRef.id;
      this.tweets.unshift(tweet);
    },
    async deletetweet(tweet){
      let storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || (storedUser.user !== tweet.user && storedUser.tipo !== 1)) {
        alert('You are not authorized to delete this tweet.');
        return;
      }
      let dateDelete = tweet.date;
      let index = this.tweets.findIndex(t => t.date === dateDelete);
      this.tweets.splice(index, 1);
      const tweetCollection = collection(db, 'tweets');
      const tweetDoc = doc(tweetCollection, tweet.id);
      await deleteDoc(tweetDoc);
    },
    relativeDate(date) {
      const now = new Date();
      const tweetDate = new Date(date);
      if (isNaN(tweetDate)) {
        console.error('Invalid date:', date);
        return '';
      }
      return formatDistance(tweetDate, now);
    }
  },
    async mounted() {
      const tweetCollection = collection(db, 'tweets');
      const q = query(tweetCollection, orderBy('date', 'desc')); // Order by 'created_at' field in descending order
      const tweetSnapshot = await getDocs(q);
      this.tweets = tweetSnapshot.docs.map(doc => ({ id: doc.id, user: doc.data().user, ...doc.data() }));
      this.tweets.forEach(tweet => {
        this.countLikes(tweet.id);
      });
    },
created() {
  this.tweets.forEach(tweet => {
    this.countLikes(tweet.id);
  });
},
};
</script>


<style>
.newtweet{
  font-size: 19px;
  line-height: 1.4 !important;
}
.divider{
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: rgb(222, 220, 220);
}
.tweet-content{
  white-space: pre-line;
}
</style>