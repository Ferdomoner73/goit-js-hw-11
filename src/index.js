import Notiflix from 'notiflix';
import { throttle } from 'throttle-debounce';
import axios from "axios";

const searchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const inputEl = document.querySelector('input');

let isLoading = false;

searchFormEl.addEventListener('submit', processingRecievedMessage);
window.addEventListener('scroll', throttle(500, (e) => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
        processingRecievedMessage(e);
    }
}));

const API_KEY = '38006870-c016c2a85f82fa326eab38f53';

let currentPage = 1;
let currentValue = null;

async function getImages(query) {
    try {
        checkCurrentValue(query);
        const url = `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;
        const response = await fetch(url);
        const data = await response.json();

        if (currentPage === 1) {
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }


        return data.hits;
    } catch (error) {
        console.log(error);
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    }
}

function checkCurrentValue(value) {
    
    if (currentValue === value) {
        return currentPage += 1;
    }
    
    currentValue = value;
    currentPage = 1;
    galleryEl.innerHTML = '';
    return currentPage; 
}

async function processingRecievedMessage(e) {
    e.preventDefault();

    
    const queryValue = inputEl.value;

    try {
        const images = await getImages(queryValue);
        
        if (images.length > 0) {
            displayImages(images);
        } else {
            showNoImagesMessage();
        }
    } catch (error) {
        console.log(error);
    }
}

function showNoImagesMessage() {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function displayImages(images) {
    console.dir(images);
    const allImgs = images.map(image => {
        return `<div class="photo-card">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${image.likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${image.views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${image.comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${image.downloads}
            </p>
        </div>
    </div>`
    }).join('');

    galleryEl.insertAdjacentHTML('beforeend', allImgs);
}