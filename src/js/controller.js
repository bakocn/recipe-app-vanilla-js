import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
const recipeContainer = document.querySelector('.recipe');
// if (module.hot) {
//   module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner(recipeContainer);
    //0)Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //1)Updating bookmarks view

    bookmarksView.update(model.state.bookmarks);
    //2)         Loading recipe
    await model.loadRecipe(id);
    //3)      Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    //Get search
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    //Load search
    await model.loadSearchResults(query);
    //3)Render results
    resultsView.render(model.getSearchResultsPage());
    //4)Render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //3)Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //4)Render NEW pagination buttons

  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings ( in state )
  model.updateServings(newServings);
  //Update the recipe view
  //1. RENDER
  // recipeView.render(model.state.recipe);
  //2. UPDATE?
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1)Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2)Update recipe view
  recipeView.update(model.state.recipe);
  //3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //Show spinner
    addRecipeView.renderSpinner();
    //UPLOAD RECIPE DATA
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //Render recipe
    recipeView.render(model.state.recipe);
    //SUCCES MESSAGE
    addRecipeView.renderMessage();
    //Render bookmakr view
    bookmarksView.render(model.state.bookmarks);
    //Change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
