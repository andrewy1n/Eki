## Inspiration
Our main inspiration came from a hiking trip that our team of two had at Joshua Tree a few weeks back, and from that trip we got bought stickers as means of remembrance of our experience. It made us think about how powerful something so small can have on us, whether it be a sticker, a photo, or a necklace. The memories and experiences we make are what give these keepsakes and souvenirs their value, and it's also what makes them valuable in our mind. Which is why we decided to create Eki, a way we can create these memorabilia virtually for our travels.

## What it does
Eki is an iOS mobile application made to memorialize your experiences through the collection of AI generated stickers and stamps of your photos, which also includes an attraction recommender powered by Llama and internet access through LLM tools. The app is heavily integrated with the Google Maps API, which gives users easy access to general traveling information.

## How we built it
### Technologies:
- React Native/Expo - Frontend
- Python, FastAPI - Backend
- Firebase - Database, Authentication, Bucket Storage
- Hyperbolic, Groq-API - Access To LLM, Vision, and Image Generation Models through Cloud \
\
For Frontend development we used the tools by Expo and React Native to develop in Expo Go, a sandboxed iOS development environment. For the backend server, we used FastAPI as the framework, and Firebase was used for our main database, as well as storage for images. We also used Firebase Auth for user authentication client side. We used Hyperbolic for our sticker image generation pipeline, using the Llama vision model and the Flux1.dev image generation model in conjunction. We used Groq-API Llama LLM model, Toolhouse, and Google Maps API for our attraction recommendation algorithm.

## Challenges we ran into
- One our main problems was figuring a way to get relatively consistent results for turning an image into a sticker/stamp. We first tried many of the image-to-image generation models, including those on HuggingFace and Hyperbolic, their results were very poor. We eventually tried the method of using a vision model to describe an image, then using a generation model to create an entirely knew image from scratch, and this way was surprisingly better and more consistent, and was especially well with the Flux1.dev model.
- A bulk of our issues were more frontend related, as Expo released a new SDK recently and it caused a lot of package deprecations that rarely had solutions online. We were forced to pivot a lot on some of our initial ideas as a result of this.

## Accomplishments that we're proud of
It was our first time working with image generation models for a hackathon project, and we believe we executed on that aspect of our app well. Even though we encountered many many bugs in this hack, we pushed through and got something done, in expense of our sleep.

## What we learned
We learned that being prepared is always important, even at hackathons. It's often the dumbest bugs that take the most time, and we just need to accept that struggling will eventually happen.

## What's next for Eki
We hope to add more social aspects into the app, such as friend and community postings, and sharing and customizing stickers. Users will be able to connect with friends, explore each other’s virtual stamp collections, and collaborate on scrapbooks. We also aim to introduce challenges, achievements, and leaderboards to enhance engagement and motivate exploration.
