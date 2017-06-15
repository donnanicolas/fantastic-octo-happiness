# fantastic-octo-happiness

> Disclaimer: The name was generated by github, I didn't know what name to use.

This application is in production on [https://tinderfy.now.sh/](Tinderfy)

## Explanation

This application is part of an interview. The objective is to use the **Spotify API** to make an simple application to showcase my React + Redux skills.

The application uses the Spotify API to recommend random music and you can choose to add it to your library by swiping right or ignore by swiping left.

# Running the application

> You should be able to use `npm` instead of `yarn`, if you have any trouble running with `npm` see [Startup Error](https://github.com/facebookincubator/create-react-app/issues/2370)

This is a [create-react-app](https://github.com/facebookincubator/create-react-app) project, so you just need to clone the project, go to the directory and run:

```
yarn install # only the first time
yarn start
```

> **ATTENTION**: If you have another application running in the port 3000, the app will start in another port, but you won't be able to use it because only `localhost:3000` and `tinderfy.now.sh` are allowed as redirect URI in the Spotify API. 

## Running Test

Just run: `yarn test`

## Technologies

This section aims to explain the decision behind some of the third party libraries I use in the project.

### React

React is used because is part of the interview requirements, but its also the library I use in my personal projects.

I love React, its an amazing tool, with an awesome ecosystem surrounding it. Over the years I've used many libraries and frameworks for developing apps: jQuery, Angular, Google Closure, Handlebars, etc. They all have many advantages, but they usually struggle with one thing: **state management**. There are two main problems: *having consistent state across the application* and *keeping the state synced with the view*. In jQuery state can be easier to manage (depends on how you structure it), but its hard to synced with the view. In Angular the reverse is true, the framework manages the syncing, but the state can change with angular events, user events and even simple objects mutations.

React on the other side, manages to do the two things beautifully. The state is immutable and can only be changed via a simple but powerful API, [`Component#setState(updated, [callback])`](https://facebook.github.io/react/docs/react-component.html#setstate), it ensures your state can only be changed inside each component, in an explicit manner, neither the *parent* nor the *children* can modify that state. On the other side, syncing the state with the view is done by **rendering** and **re-rendering** every time the state (or the props) changes. This allow for predictable apps, so predictable that even the testing tools can take advantage of that, for example [jest snapshots](https://facebook.github.io/jest/docs/snapshot-testing.html).

### Redux

There are many reason to use Redux (or any Flux like state management) and many people have written great posts about it, so I will try to be brief. Having a single source of truth about the state of your application allows for predictable and easy to test code.

One extra point for Redux are middlewares, that allow to integrate many tools, like side effect handlers, based on the **actions**

### Flowtype

I love static typing and more so if they can be inferred by the analyzer, and flow gives you exactly that.

One thing I thinks its essential is documentation, but writing tends to be tedious and hard to maintain. A simple solution is using the code as documentation, types allow you to do that. Having expressive names and types can give 80% of the information you need about an function.

Also, **flow** is designed to find errors (**TypeScript** is design around tooling: autocomplete, etc.). Many times I have caught an error before running the code, because **flow** highlighted that the parameter type was wrong. Finally, **refactors**, refactors are so much easier if something tells you that you haven't changed that function call for the new parameters.

### Styled Components

This is more of a personal choice. There are many great tools for styling in React, but I love functional programming, and this library gives you the ability to easily generate functions that apply styles to your **Components**, and since they are all pure functions, you can compose them. Example:

```
const MegaStyledComponent = applyFlexContainer(
  applyFullHeight(
    applyScrollable(
      applyBordered(
        SimpleComponent
      )
    )
  )
)
```

This is not a good example (please don't do this), but it showcases what you can do.

### React Router V4

There are many routers for react. I choose this because it's just components, nothing else. They are components that "react" to the changes in the URL. In this case I'm using [ConnectedRouter](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux) that its not connected to the URL but to the redux state and there is a middleware that syncs the state with the URL.

It has a simple, really declarative API, and it makes the routes the "react way", with composable components.

### Redux Observables

Even though this app is small and a side effects library is not really necessary, using one can really help keep your app easy to test and scalable.

Observables have a complex API and add some boilerplate to the application but once you understand how they work, its really easy to know whats happening and its simple to debug.

### Superagent

Superagent is a library for doing HTTP request from node and the browser. Redux-observables has its own functions for this, but they don't work well with the Spotify API because of an extra header they add and CORS. So we have to use superagent.

Unfortunately this makes testing clumsier, because we have to use a `setTimeout` with **100** a milliseconds wait for the **superagent** requests to finish.

# State

> A section describing how the state is designed

For handling state we have to take three things in account:

* Minimal Representation of the app state
* Normalization
* Selectors

## Minimal Representation

When we design our app we shouldn't add everything to the app state. We want to have the least amount of data possible in that. There are two reasons: **performance** and **maintainability**

### Performance

> Premature optimization is the root of **all evil**

Even thought we should be concerned with performance until we need to, we should be careful of not doing the exact opposite, making everything slow.

If our state is small, there are less updates to it, that means less react re-renders.

### Maintainability
Big states are harder to keep "up to date", meaning that our reducers will handle a lot of actions.

Actions should have a single responsibility, if the action type is `FETCH_USER` it shouldn't fetch the **user** and the **messages**. This helps state be predictable and easy to maintain

If every update in your inputs is sent to your Redux Store the app performance will drop dramatically and it will be really hard to maintain. Things like this are what you should avoid.

## Normalization

Even thought at first glance normalizing data may seem more work, it actually helps a lot. It mostly helps to make updates faster and simpler. Example:

Using our app as example, our state save the tracks, here are the two examples:

### Not normalized reducer
```
// state = { tracks: Track[] }

function reducer ({ tracks } = { tracks: [] }, { type, payload }) {
  switch (type) {
    case 'LOAD_TRACKS':
      const newTracks = tracks.concat(payload);
      // We use Lodash#uniqBy, tracking uniq values in an Array<Object> is messier than in an array of Array<string>
      const uniqTracks = uniqBy(newTracks, t => t.id);
      return { ...state, tracks: uniqTracks };
    case 'TRACK_LIKED':
      const newTracks = tracks.map(track => {
        if (track.id !== payload.id) return track;
        return {
          ...track,
          liked: true,
        }
      })
      return { ...state, tracks: uniqTracks };
    default:
      return state
  }
});
```

### Normalized Reducer
```
// state = { tracks: string[], tracksById: { [x:string]: Track } }

function reducer ({ tracks, tracksById } = { tracks: [], tracksById: {} }, { type, payload }) {
  switch (type) {
    case 'LOAD_TRACKS':
      const uniqTracks = uniq(payload.map(t => t.id)); // We use Lodash#uniq
      const newTracksById = {}
      payload.forEach(track => newTracksById[track.id] = track);
      const allTracksById = { ...tracksById, newTracksById };
      return { ...state, tracks: uniqTracks, tracksById: allTracksById };
    case 'TRACK_LIKED':
      const { id } = payload;
      const track = { ...tracksById[id], liked: true };
      const newTracksById = { ...tracksById, [id]: track }
      return { ...state, tracksById: newTracksById };
    default:
      return state
  }
});
```

When you see the two formats, the first one seems a lot simpler, but check in TRACK_LIKED, we had to map over all the tracks, even though is a simple operation, if we have many records, is a heavy operation for a simple update.

Also in the LOAD_TRACKS, we have to be sure about uniqueness, we use **Lodash** to make it simpler in both cases, but in the Normalized one we could use and **ES6 Set** (like this `Array.from(new Set(array));`), that we couldn't use in the not normalized one.

There are a lot of better examples, like when searching for a **given track by id**, or updating nested objects (when normalizing we would split the data in two reducers or properties)