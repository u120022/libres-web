import { Route, Routes, Router } from "@solidjs/router";
import { Component } from "solid-js";
import Book from "./Book";
import BookList from "./BookList";
import LibraryList from "./LibraryList";
import LibraryListChecked from "./LibraryListChecked";
import LibraryListCheckedGeocode from "./LibraryListCheckedGeocode";
import Login from "./Login";
import Register from "./Register";
import Successful from "./Successful";
import Reserve from "./Reserve";
import ReservedList from "./ReservedList";
import User from "./User";

const App: Component = () => {
  return (
    <Router>
      <Routes>
        <Route path={["/", "book"]} component={BookList} />
        <Route path="/book/:isbn" component={Book} />
        <Route path="/library" component={LibraryList} />
        <Route path="/library_checked" component={LibraryListChecked} />
        <Route
          path="/library_checked_geocode"
          component={LibraryListCheckedGeocode}
        />
        <Route path="/reserve" component={Reserve} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/user" component={User} />
        <Route path="/reserved" component={ReservedList} />
        <Route path="/successful" component={Successful} />
      </Routes>
    </Router>
  );
};

export default App;
