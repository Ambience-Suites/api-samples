// Enhanced Gallery JavaScript with AI Features
// Ambience Suites Enhanced Gallery - YouTube Gallery UI/UX

// Global variables
let currentVideo = null;
let videoLibrary = [];
let activeList = [];
let videoTags = {};
let userPresets = {
    quality: 'auto',
    autoplay: false,
    volume: 50,
    theme: 'light'
};
let currentWatchParty = null;
let searchSuggestions = [];

// Initialize when API is loaded
function handleAPILoaded() {
    console.log('YouTube API loaded successfully');
    initializeGallery();
    loadSavedData();
}

// Initialize gallery
function initializeGallery() {
    // Load sample videos
    loadSampleVideos();
    
    // Set up search assist
    setupSearchAssist();
    
    // Load presets
    loadPresets();
    
    // Initialize Material Design components
    if (typeof componentHandler !== 'undefined') {
        componentHandler.upgradeDom();
    }
    
    console.log('Gallery initialized with Ambience Suites Enhanced Gallery AI features');
}

// Load sample videos for demonstration
function loadSampleVideos() {
    const sampleVideoIds = [
        'M7lc1UVf-VE', // YouTube Spotlight
        'dQw4w9WgXcQ', // Popular video
        '9bZkp7q19f0', // Gangnam Style
        'kJQP7kiw5Fk', // Luis Fonsi - Despacito
        'JGwWNGJdvx8', // Ed Sheeran
        'fJ9rUzIMcZQ', // Queen
        '60ItHLz5WEA', // Alan Walker
        'hT_nvWreIhg', // OneRepublic
        '450p7goxZqg', // All of Me
        'CevxZvSJLk8'  // Katy Perry
    ];
    
    sampleVideoIds.forEach((videoId, index) => {
        fetchVideoDetails(videoId, index);
    });
}

// Fetch video details from YouTube API
function fetchVideoDetails(videoId, index) {
    if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.youtube) {
        // Fallback for demo purposes
        addVideoToGallery({
            id: videoId,
            title: `Sample Video ${index + 1}`,
            channel: 'Demo Channel',
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            description: 'This is a sample video for the enhanced gallery demonstration.'
        });
        return;
    }
    
    const request = gapi.client.youtube.videos.list({
        part: 'snippet,statistics',
        id: videoId
    });

    request.execute(function(response) {
        if (response.items && response.items.length > 0) {
            const video = response.items[0];
            addVideoToGallery({
                id: video.id,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.medium.url,
                description: video.snippet.description
            });
        }
    });
}

// Add video to gallery
function addVideoToGallery(video) {
    videoLibrary.push(video);
    
    // Initialize tags for this video if not exists
    if (!videoTags[video.id]) {
        videoTags[video.id] = [];
    }
    
    renderGallery();
}

// Render gallery
function renderGallery() {
    const galleryContainer = document.getElementById('video-gallery');
    if (!galleryContainer) return;
    
    galleryContainer.innerHTML = '';
    
    if (videoLibrary.length === 0) {
        galleryContainer.innerHTML = '<p class="empty-state">No videos found. Try searching for videos!</p>';
        return;
    }
    
    videoLibrary.forEach(video => {
        const videoCard = createVideoCard(video);
        galleryContainer.appendChild(videoCard);
    });
}

// Create video card element
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => openVideoDialog(video);
    
    const tags = videoTags[video.id] || [];
    const tagsHtml = tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    card.innerHTML = `
        <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
        <div class="video-info">
            <h4 class="video-title">${video.title}</h4>
            <p class="video-channel">${video.channel}</p>
            <div class="tags-container">${tagsHtml}</div>
            <div class="video-actions">
                <button class="mdl-button mdl-js-button mdl-button--raised" 
                        onclick="event.stopPropagation(); addToActiveList('${video.id}')">
                    <i class="material-icons">bookmark</i>
                </button>
                <button class="mdl-button mdl-js-button mdl-button--raised" 
                        onclick="event.stopPropagation(); shareVideo('${video.id}')">
                    <i class="material-icons">share</i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Open video dialog
function openVideoDialog(video) {
    currentVideo = video;
    const dialog = document.getElementById('video-dialog');
    const dialogTitle = document.getElementById('dialog-title');
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    dialogTitle.textContent = video.title;
    
    // Embed YouTube player
    videoPlayerContainer.innerHTML = `
        <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/${video.id}?autoplay=0" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
    `;
    
    // Display tags
    renderVideoTags(video.id);
    
    if (dialog.showModal) {
        dialog.showModal();
    } else {
        dialog.setAttribute('open', '');
    }
}

// Render video tags
function renderVideoTags(videoId) {
    const tagsContainer = document.getElementById('video-tags');
    const tags = videoTags[videoId] || [];
    
    tagsContainer.innerHTML = tags.map(tag => 
        `<span class="tag">
            ${tag}
            <span class="remove-tag" onclick="removeTag('${videoId}', '${tag}')">×</span>
        </span>`
    ).join('');
}

// Add tag to video
function addTag() {
    if (!currentVideo) return;
    
    const tagInput = document.getElementById('new-tag');
    const tag = tagInput.value.trim();
    
    if (tag && !videoTags[currentVideo.id].includes(tag)) {
        videoTags[currentVideo.id].push(tag);
        renderVideoTags(currentVideo.id);
        renderGallery();
        saveData();
    }
    
    tagInput.value = '';
}

// Remove tag from video
function removeTag(videoId, tag) {
    if (videoTags[videoId]) {
        videoTags[videoId] = videoTags[videoId].filter(t => t !== tag);
        renderVideoTags(videoId);
        renderGallery();
        saveData();
    }
}

// Close video dialog
function closeDialog() {
    const dialog = document.getElementById('video-dialog');
    if (dialog.close) {
        dialog.close();
    } else {
        dialog.removeAttribute('open');
    }
    currentVideo = null;
}

// Search Assist Feature
function setupSearchAssist() {
    const searchInput = document.getElementById('search-query');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!searchInput) return;
    
    // AI-powered search suggestions
    const commonSuggestions = [
        'Music videos',
        'Tutorial videos',
        'Gaming videos',
        'Cooking recipes',
        'Travel vlogs',
        'Tech reviews',
        'Movie trailers',
        'Educational content',
        'Comedy sketches',
        'Sports highlights'
    ];
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsContainer.classList.remove('active');
            return;
        }
        
        // Filter suggestions based on input
        const filtered = commonSuggestions.filter(s => 
            s.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length > 0) {
            displaySuggestions(filtered);
        } else {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
            suggestionsContainer.classList.remove('active');
        }
    });
}

// Display search suggestions
function displaySuggestions(suggestions) {
    const container = document.getElementById('search-suggestions');
    
    container.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">
            <i class="material-icons" style="vertical-align: middle; margin-right: 8px;">search</i>
            ${suggestion}
        </div>`
    ).join('');
    
    container.classList.add('active');
}

// Select suggestion
function selectSuggestion(suggestion) {
    const searchInput = document.getElementById('search-query');
    searchInput.value = suggestion;
    document.getElementById('search-suggestions').classList.remove('active');
    performSearch();
}

// Perform search
function performSearch() {
    const query = document.getElementById('search-query').value.trim();
    
    if (!query) return;
    
    console.log('Searching for:', query);
    
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.youtube) {
        const request = gapi.client.youtube.search.list({
            q: query,
            part: 'snippet',
            maxResults: 10,
            type: 'video'
        });

        request.execute(function(response) {
            if (response.items) {
                videoLibrary = [];
                response.items.forEach(item => {
                    addVideoToGallery({
                        id: item.id.videoId,
                        title: item.snippet.title,
                        channel: item.snippet.channelTitle,
                        thumbnail: item.snippet.thumbnails.medium.url,
                        description: item.snippet.description
                    });
                });
            }
        });
    } else {
        alert('Search feature requires YouTube API authentication. This is a demo version.');
    }
}

// Active List (Bookmarking) Feature
function addToActiveList(videoId) {
    const video = videoId ? videoLibrary.find(v => v.id === videoId) : currentVideo;
    
    if (!video) return;
    
    if (!activeList.find(v => v.id === video.id)) {
        activeList.push(video);
        renderActiveList();
        saveData();
        showNotification('Added to Active List!');
    } else {
        showNotification('Already in Active List!');
    }
}

// Render active list
function renderActiveList() {
    const container = document.getElementById('active-list');
    
    if (activeList.length === 0) {
        container.innerHTML = '<p class="empty-state">No bookmarked videos yet. Add videos from the gallery!</p>';
        return;
    }
    
    container.innerHTML = activeList.map(video => 
        `<div class="bookmark-item">
            <div>
                <h4>${video.title}</h4>
                <p style="color: #666; margin: 5px 0;">${video.channel}</p>
            </div>
            <div>
                <button class="mdl-button mdl-js-button mdl-button--icon" 
                        onclick="playFromActiveList('${video.id}')">
                    <i class="material-icons">play_arrow</i>
                </button>
                <button class="mdl-button mdl-js-button mdl-button--icon" 
                        onclick="removeFromActiveList('${video.id}')">
                    <i class="material-icons">delete</i>
                </button>
            </div>
        </div>`
    ).join('');
}

// Remove from active list
function removeFromActiveList(videoId) {
    activeList = activeList.filter(v => v.id !== videoId);
    renderActiveList();
    saveData();
    showNotification('Removed from Active List');
}

// Play from active list
function playFromActiveList(videoId) {
    const video = activeList.find(v => v.id === videoId);
    if (video) {
        openVideoDialog(video);
    }
}

// Presets Feature
function savePresets() {
    userPresets = {
        quality: document.getElementById('quality-preset').value,
        autoplay: document.getElementById('autoplay-preset').checked,
        volume: parseInt(document.getElementById('volume-preset').value),
        theme: document.getElementById('theme-preset').value
    };
    
    saveData();
    applyPresets();
    showNotification('Presets saved successfully!');
}

function loadPresets() {
    document.getElementById('quality-preset').value = userPresets.quality;
    document.getElementById('autoplay-preset').checked = userPresets.autoplay;
    document.getElementById('volume-preset').value = userPresets.volume;
    document.getElementById('volume-value').textContent = userPresets.volume + '%';
    document.getElementById('theme-preset').value = userPresets.theme;
    
    // Update volume display
    document.getElementById('volume-preset').addEventListener('input', function(e) {
        document.getElementById('volume-value').textContent = e.target.value + '%';
    });
    
    applyPresets();
}

function applyPresets() {
    // Apply theme
    if (userPresets.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    console.log('Applied presets:', userPresets);
}

// Watch Party Feature
function createWatchParty() {
    const partyName = document.getElementById('party-name').value.trim();
    
    if (!partyName) {
        alert('Please enter a party name');
        return;
    }
    
    const partyCode = generatePartyCode();
    currentWatchParty = {
        name: partyName,
        code: partyCode,
        host: true,
        members: ['You (Host)'],
        createdAt: new Date().toISOString()
    };
    
    displayActiveParty();
    showNotification(`Watch Party created! Code: ${partyCode}`);
}

function joinWatchParty() {
    const partyCode = document.getElementById('party-code').value.trim();
    
    if (!partyCode) {
        alert('Please enter a party code');
        return;
    }
    
    // Simulate joining party
    currentWatchParty = {
        name: 'Joined Party',
        code: partyCode,
        host: false,
        members: ['Host', 'You'],
        createdAt: new Date().toISOString()
    };
    
    displayActiveParty();
    showNotification('Joined Watch Party successfully!');
}

function displayActiveParty() {
    const container = document.getElementById('active-party');
    
    if (!currentWatchParty) {
        container.innerHTML = '<p>No active watch party</p>';
        return;
    }
    
    container.innerHTML = `
        <h4>🎉 ${currentWatchParty.name}</h4>
        <p><strong>Party Code:</strong> ${currentWatchParty.code}</p>
        <p><strong>Role:</strong> ${currentWatchParty.host ? 'Host' : 'Participant'}</p>
        <div class="party-members">
            <strong>Members (${currentWatchParty.members.length}):</strong>
            ${currentWatchParty.members.map(member => 
                `<div class="party-member">
                    <i class="material-icons">person</i>
                    ${member}
                </div>`
            ).join('')}
        </div>
        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" 
                onclick="leaveWatchParty()" style="margin-top: 15px;">
            Leave Party
        </button>
    `;
}

function leaveWatchParty() {
    currentWatchParty = null;
    displayActiveParty();
    showNotification('Left Watch Party');
}

function generatePartyCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Support Publisher Feature
function loadPublishers() {
    const container = document.getElementById('publisher-list');
    
    // Sample publishers
    const publishers = [
        { name: 'Tech Channel', subscribers: '1.2M', avatar: '🎮' },
        { name: 'Music Studio', subscribers: '850K', avatar: '🎵' },
        { name: 'Cooking Master', subscribers: '500K', avatar: '👨‍🍳' },
        { name: 'Travel Explorer', subscribers: '2.1M', avatar: '✈️' }
    ];
    
    container.innerHTML = publishers.map(publisher => 
        `<div class="publisher-card">
            <div class="publisher-avatar" style="font-size: 40px; line-height: 80px;">
                ${publisher.avatar}
            </div>
            <h4 class="publisher-name">${publisher.name}</h4>
            <p class="publisher-stats">${publisher.subscribers} subscribers</p>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored support-button" 
                    onclick="supportPublisher('${publisher.name}')">
                <i class="material-icons">favorite</i> Support
            </button>
        </div>`
    ).join('');
}

function supportPublisher(publisherName) {
    showNotification(`Thank you for supporting ${publisherName}!`);
}

// Library Load/Download Feature
function showLibraryDialog() {
    const dialog = document.getElementById('library-dialog');
    if (dialog.showModal) {
        dialog.showModal();
    } else {
        dialog.setAttribute('open', '');
    }
}

function closeLibraryDialog() {
    const dialog = document.getElementById('library-dialog');
    if (dialog.close) {
        dialog.close();
    } else {
        dialog.removeAttribute('open');
    }
}

function downloadLibrary() {
    const libraryData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        videos: videoLibrary,
        activeList: activeList,
        tags: videoTags,
        presets: userPresets
    };
    
    const dataStr = JSON.stringify(libraryData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ambience-suites-gallery-library.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Library downloaded successfully!');
}

function loadLibrary(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const libraryData = JSON.parse(e.target.result);
            
            if (libraryData.videos) videoLibrary = libraryData.videos;
            if (libraryData.activeList) activeList = libraryData.activeList;
            if (libraryData.tags) videoTags = libraryData.tags;
            if (libraryData.presets) userPresets = libraryData.presets;
            
            renderGallery();
            renderActiveList();
            loadPresets();
            saveData();
            
            showNotification('Library loaded successfully!');
            closeLibraryDialog();
        } catch (error) {
            alert('Error loading library file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Data Persistence
function saveData() {
    const data = {
        activeList: activeList,
        tags: videoTags,
        presets: userPresets
    };
    
    localStorage.setItem('ambienceSuitesGallery', JSON.stringify(data));
}

function loadSavedData() {
    const saved = localStorage.getItem('ambienceSuitesGallery');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.activeList) activeList = data.activeList;
            if (data.tags) videoTags = data.tags;
            if (data.presets) userPresets = data.presets;
            
            renderActiveList();
            loadPresets();
            loadPublishers();
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    } else {
        loadPublishers();
    }
}

// Section Navigation
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Sort Gallery
function sortGallery() {
    const sortOptions = ['Title (A-Z)', 'Title (Z-A)', 'Channel'];
    const choice = prompt('Sort by:\n1. Title (A-Z)\n2. Title (Z-A)\n3. Channel\n\nEnter number:');
    
    switch(choice) {
        case '1':
            videoLibrary.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case '2':
            videoLibrary.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case '3':
            videoLibrary.sort((a, b) => a.channel.localeCompare(b.channel));
            break;
        default:
            return;
    }
    
    renderGallery();
}

// Filter Gallery
function filterGallery() {
    const allTags = new Set();
    Object.values(videoTags).forEach(tags => {
        tags.forEach(tag => allTags.add(tag));
    });
    
    if (allTags.size === 0) {
        alert('No tags available. Add tags to videos first!');
        return;
    }
    
    const tagList = Array.from(allTags).join('\n');
    const selectedTag = prompt('Filter by tag:\n\n' + tagList + '\n\nEnter tag name:');
    
    if (!selectedTag) return;
    
    const filtered = videoLibrary.filter(video => 
        videoTags[video.id] && videoTags[video.id].includes(selectedTag)
    );
    
    if (filtered.length === 0) {
        alert('No videos found with that tag');
        return;
    }
    
    const temp = videoLibrary;
    videoLibrary = filtered;
    renderGallery();
    
    setTimeout(() => {
        if (confirm('Show all videos again?')) {
            videoLibrary = temp;
            renderGallery();
        }
    }, 3000);
}

// Share Video
function shareVideo(videoId) {
    const video = videoLibrary.find(v => v.id === videoId);
    if (video) {
        const url = `https://www.youtube.com/watch?v=${video.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Check out: ${video.title}`,
                url: url
            });
        } else {
            prompt('Share this URL:', url);
        }
    }
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #323232;
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on page load
window.addEventListener('load', function() {
    console.log('Ambience Suites Enhanced Gallery loaded');
    
    // Initialize gallery if API is not available
    if (typeof gapi === 'undefined' || !gapi.client) {
        setTimeout(() => {
            if (typeof handleAPILoaded === 'function') {
                handleAPILoaded();
            }
        }, 1000);
    }
});
