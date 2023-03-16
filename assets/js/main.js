/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')


/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show-menu')
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show-menu')
    })
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))























/*========================= DYNAMICALLY GENERATED SKILLS =======================*/

fetch("https://api.github.com/repos/edwinguerrerotech/spell-book/git/trees/main?recursive=1")
    .then(response => {
        return response.json(); 
    })
    .then(result => {
        // result.tree.forEach(branch => {
        //     console.log(branch.path)
        // })
        return parseSkillTree(result.tree);
    })
    // .then(branches => {
    //     branches.forEach(skillData => {
    //         let skillDiv = skillToDiv(skillData);
    //         // Add the element to webpage+
    //         let skillList = document.getElementById('skill-list-' + skillData.pathCategory);
    //         skillList.appendChild(skillDiv);
    //     })
    // });

class Skill {
      
    constructor() {
        this._pathSkill = "";
        this._pathCategory = ""; // backend, frontend, design ....
        this._parts = [];
        this._sections = [];
        this._articles = [];
        this._bookTreeDepth = 0; // 1-3 Article | Section |  Part
        this._articleCount = 0; 
        this._totalArticleCount = 0;
    }   

    set pathSkill(pathSkill) { this._pathSkill = pathSkill; }
    set pathCategory(pathCategory) { this._pathCategory = pathCategory; }

    set bookTreeDepth(bookTreeDepth) { this._bookTreeDepth = bookTreeDepth; }
    set articleCount(articleCount) { this._articleCount = articleCount; }
    set totalArticleCount(totalArticleCount) { this._totalArticleCount = totalArticleCount; }
    
    get pathSkill() { return this._pathSkill; }
    get pathCategory() { return this._pathCategory; }
    // Return without the sequential numbers.
    get title() {
            let skillTitle = this._pathSkill.split(" ");
            return skillTitle[1];
        }
    get parts() { return this._parts; }
    get sections() { return this._sections; }
    get articles() { return this._articles; } 
    get percentage() { 
        return Math.round((this._articleCount / this._totalArticleCount) * 100 ) + "%"; 
    }
    get bookTreeDepth() { return this._bookTreeDepth; }
    
} 

class Part {
    constructor(pathTitle) {
        this._pathTitle = pathTitle;
        this._sections = [];
    }

    get sections() { return this._sections; }  
    get pathTitle() { return this._pathTitle; } 
}

class Section {
    constructor(pathTitle) {
        this._pathTitle = pathTitle;
        this._articles = [];
    }
    get articles() { return this._articles; }
    get pathTitle() { return this._pathTitle; }
}

class Article {
    constructor(path, pathTitle) {
        // includes path title, but doesn't include anything before category.
        this._path = path; 
        this._pathTitle = pathTitle; // mandatory
        this._hasYAML = false;

        this._youtubeURL = ""; // optional
        this._bloggerURL = ""; // optional
        // Just because there is a Github link, doesn't mean there should be 
        //  a value here. Only fill this in...
        //      
        //      if article file tree is >1 level deep.
        //      if there's >= 1 snippet.
        //      
        this._githubURL = ""; // conditional  
        // Optional but If no snippets and only 1 level deep: auto 
        // If auto, you would display all code from each file as snippets.
        this._snippets = []; // optional  
    }
    get path() { return this._path }
    get pathTitle() { return this._pathTitle }
    set hasYAML(hasYAML) { this._hasYAML = hasYAML; }
    get hasYAML() { return this._hasYAML; }
    set youtubeURL(youtubeURL) { this._youtubeURL = youtubeURL; }
    get youtubeURL() { return this._youtubeURL; }
}

let Snippet = {
    filePath: "",
    ranges: []
}

let Range = {
    startLine: 0,
    endLine: 0
}

/*================================ PARSE SKILL TREE */

const category_Index = 0;
const skill_Index = 1;
const level_1_Index = 2;
const level_2_Index = 3;
const level_3_Index = 4;
const level_4_Index = 5;

function parseSkillTree(tree) {

    // Skill object
    let parsedSkillBook = new Skill();
    // For gradually saving all the skills.
    let book_branches = [];
    let parsedSkillBooks = [];
    // To know which parser to use.
    let bookTreeDepth = 0; // 1-3
    // Path as an array of strings seperated by "/".
    let splitPath = [];
    let currentDepthIndex = 0;

    tree.shift(); // trim off .gitignore
    tree.shift(); // trim off README.md 


    // Determine book depth by looping through the tree array
    tree.forEach(function(branch) {
        splitPath = branch.path.split("/");
        currentDepthIndex = splitPath.length - 1;

        // Keep pushing into the array as long as it isn't a path with just the category.
        // I don't want any of the parsers worrying about that. Too many logical errors.
        if (currentDepthIndex != category_Index) {
            book_branches.push(branch);
        }
        if (currentDepthIndex === level_1_Index) {
            // If it does not start with a digit (TOTAL#.md file), you're on the last item of a skill.
            if (splitPath[level_1_Index].match(/^\d/) ===  null) {
                // Pass the skill tree to the appropriate parser.
                // if (bookTreeDepth === 1) {
                //     parsedSkillBook = parseBook_1LevelDeep(book_branches);
                // }
                //else 
                if (bookTreeDepth === 2) {
                    parsedSkillBook = parseBook_2LevelsDeep(book_branches);
                }
                // else if (bookTreeDepth === 3) {
                //     parsedSkillBook = parseBook_3LevelsDeep(book_branches);
                // }
                parsedSkillBooks.push(parsedSkillBook);
                // Reset branches for the next skill.
                book_branches = [];
            }
        } 

                // Guaranteed to go at least this far throughout the entire life cycle of 
        //  a skill.
        if (currentDepthIndex === level_2_Index) {
            // If it does not start with a digit... 
            if (splitPath[level_2_Index].match(/^\d/) === null) {
                bookTreeDepth = 1;
            }
        } 
    
        // May or may not reach this far
        if (currentDepthIndex === level_3_Index) {
            // If it doesn't start with a digit...
            if (splitPath[level_3_Index].match(/^\d/) === null) {
                bookTreeDepth = 2;
            }
            else {  // It does start with a digit...
                bookTreeDepth = 3;
            }
        }
 
    })

    return parsedSkillBooks;
}

function parseBook_1LevelDeep(tree) {

    // This tree only contains one skill/book, therefore this function will only handle 
    //  one Skill object.

    //  - The tree starts with category/skill.
    //  - The tree ends with category/skill/total.md file.

    //      1. Get the category, skill name and max total of articles. 
    //      2. Then finally iterate through the rest off the tree to add data to the Skill object.

    // Trim the tree.
    let categoryAndSkillBranch = tree.shift(); // Remove 1st element
    let maxTotalBranch = tree.pop(); // Remove last element

    let path = categoryAndSkillBranch.path.split("/");
    let category = path[0];
    let skill = path[1];
    path = maxTotalBranch.path.split("/");
    let maxTotal = path[2].match(/\d+/g)[0]; // match() returns an array of matches.

    console.log(category);
    console.log(skill);
    console.log(maxTotal);
    console.log("\n");

    let book = new Skill();
    book.bookTreeDepth = 1;
    book.pathCategory = category;
    book.pathSkill = skill;
    book.totalArticleCount = maxTotal;
    
    let articleCount = 0;
    console.log("NEW BOOK: \n\n");
    // Iterate through the whole tree that belongs to this one skill book.
    for (i = 0; i < tree.length; i++) {
        console.log(tree[i].path);
        // Get the full path.
        let branch = tree[i];
        let fullPath = branch.path.split("/");
        // Get article directory.
        if(fullPath.length === 3) {
            // Get article title and it's path.
            let article = fullPath[2];
            let directory = category + '/' + skill + '/';
            book.articles.push(new Article(directory, article));
            articleCount++;
        // Check for config.yml
        }else if(fullPath.length === 4){
            console.log("\nSCANNING: " + fullPath + "\n");
            if (fullPath[3].search('config.yml') >= 0) {
                console.log("* Has yaml *\n");
                book.articles[book.articles.length-1].hasYAML = true;
            }
            console.log("\n");
        }
    }
    book.articleCount = articleCount;
    console.log("\n");
    console.log(book);
    console.log("\n\n\n\n");
    return book;
}

function parseBook_2LevelsDeep(tree) {
    // Trim the tree.
    let categoryAndSkillBranch = tree.shift(); // Remove 1st element
    let maxTotalBranch = tree.pop(); // Remove last element

    let path = categoryAndSkillBranch.path.split("/");
    let category = path[0];
    let skill = path[1];
    path = maxTotalBranch.path.split("/");
    let maxTotal = path[2].match(/\d+/g)[0]; // match() returns an array of matches.

    console.log(category);
    console.log(skill);
    console.log(maxTotal);
    console.log("\n");

    let book = new Skill();
    book.bookTreeDepth = 1;
    book.pathCategory = category;
    book.pathSkill = skill;
    book.totalArticleCount = maxTotal;

    let articleCount = 0;
    console.log("NEW BOOK: \n\n");
    // Iterate through the whole tree that belongs to this one skill book.
    for (i = 0; i < tree.length; i++) {
        console.log(tree[i].path);
        // Get the full path.
        let branch = tree[i];
        let fullPath = branch.path.split("/");
    }

    book.articleCount = articleCount;
    //console.log("\n");
    //console.log(book);
    console.log("\n\n\n\n");
    //return book;
}

function parseBook_3LevelsDeep(tree) {
    let path = null;
    let pathPart = null;
    let pathSection = null;
    let pathArticle = null;
    let url = null;
    // How many there are.
    let articleCount = 0;
    // How many there should be.
    let totalArticleCount = 0;
    let hasYAML = false;
    let book = new Skill();
    book.bookTreeDepth = 3;

    // Get category and skill titles.
    // The first path in the tree will always include both.
    for (i = 0; i < tree.length;) {
        path = tree[i++].path.split('/');
        // If the last item in the tree, parse the TOTAL#.md file. It's the 3rd item in the path.
        if (i === tree.length - 1) { 
            totalArticleCount = path[2].match(/\d+/g); 
            book.articleCount = articleCount;
            book.totalArticleCount = totalArticleCount;
        }
        book.pathCategory = path[0];
        book.pathSkill = path[1];

        // Get part title.
        for(partIndex = 0; i < tree.length; partIndex++) {
            path = tree[i++].path.split('/');
            pathPart = path[2];
            book.parts.push(new Part(pathPart));

            // Get section title.
            for (sectionIndex = 0; i < tree.length; sectionIndex++) {
                path = tree[i++].path.split('/');
                pathSection = path[3];
                book.parts[partIndex].sections.push(new Section(pathSection));

                // Get article title and url.
                for (;i < tree.length;) {
                    url = tree[i].url;
                    path = tree[i++].path.split('/');
                    pathArticle = path[4];
                    // Get the full directory path but without the article title.
                    let pathDirectory = "";
                    for (pathindex = 0; pathindex < path.length - 1; pathindex++) {
                        pathDirectory += path[pathindex];
                    }
                    book.parts[partIndex].sections[sectionIndex].articles.push(new Article(pathDirectory, pathArticle));
                    articleCount++;

                    // Search for config file in this article directory.
                    for(done = false ;done = false;) {
                        path = tree[i++].path.split('/');
                        // If there's no more article content, exit;
                        if (path.length < 6) { 
                            done = true;
                        }
                        else {
                            if (path[5].search('config.yml') >= 0) {
                                hasYAML = true;
                            }
                            else { hasYAML = false; }
                        }
                    }
                }
            }
        }
    }
    return book;
}

/*================================ GENERATE SKILL BUTTON/s */

function skillToDiv(skillData) {

    //  Skill container
    let skillDiv = document.createElement('div');
    skillDiv.className = 'skill skill__close';

        // Skill Button
        let skillButton = document.createElement('div');
        skillButton.classList.add('skill__button');

            //  Header container
            let header = document.createElement('div');
            header.classList.add('skill__header');

                // Skill name
                let title = document.createElement('h3');
                title.classList.add('skill__title');
                title.innerText = skillData.pathTitle;
                // Skill percentage
                let percentage = document.createElement('span');
                percentage.classList.add('skill__percentage');
                percentage.innerText = skillData.percentage;

            //  Skill bar container
            let progressBar = document.createElement('div');
            progressBar.classList.add('skill__progress__bar');
            
                // Skill bar fill
                let progress = document.createElement('span');
                progress.classList.add('skill__progress');
                progress.style.width = skillData.percentage;
            
        // Skill book container
        let book = document.createElement('div');
        book.classList.add('skill__book');

    
    header.appendChild(title);
    header.appendChild(percentage);

    progressBar.appendChild(progress);

    skillButton.appendChild(header);
    skillButton.appendChild(progressBar);

    skillDiv.appendChild(skillButton);
    skillDiv.appendChild(book);

    //console.log(skillData.sections);
    // Append the book contents to the book.
    if (skillData.bookTreeDepth === 1) { 
        // Add event listener to skillButton to make it load icon
        //  data for each of it's articles as soon as skillButton is clicked.
        // The other way that the other bookTreeDepths need to be loaded,
        //  is to call loadIconsForArticles(event) in toggleSkillSection().
        articleElementListContainer = articlesToElementList(skillData.articles);
        book.appendChild(articleElementListContainer); 

        skillButton.articles = skillData.articles;
        skillButton.articleElementListContainer = articleElementListContainer;
        skillButton.addEventListener('click', loadIconsForArticles);
    }
    if (skillData.bookTreeDepth === 2) { book.appendChild(sectionsToButtonList(skillData.sections)); }
    if (skillData.bookTreeDepth === 3) { book.appendChild(partsToButtonList(skillData.parts)); }

    skillButton.addEventListener('click', toggleSkill);

    return skillDiv;
}

function partsToButtonList(parts) {
    let partsList = document.createElement('div');
    parts.forEach((partData) => {
        let part = document.createElement('div');
        part.classList.add('skill__part');
        part.classList.add('skill__part__close');
            let partButton = document.createElement('div');
            partButton.classList.add('skill__part__button');
                let partHeader = document.createElement('div');
                    let partTitle = document.createElement('h3');
                    partTitle.classList.add('skill__part__title');
            let sectionsList = sectionsToButtonList(partData.sections);
        partTitle.innerText = partData.pathTitle;
        partHeader.appendChild(partTitle);
        partButton.appendChild(partHeader);
        partButton.addEventListener('click', toggleSkillPart);
        part.appendChild(partButton);
        part.appendChild(sectionsList);
        partsList.appendChild(part);
    })
    return partsList;
}

function sectionsToButtonList(sections) {
    let sectionsList = document.createElement('div');
    sections.forEach((sectionData) => {
        let section = document.createElement('div');
        section.classList.add('skill__section');
        section.classList.add('skill__section__close');
            let sectionButton = document.createElement('div');
            sectionButton.classList.add('skill__section__button');
                let sectionHeader = document.createElement('div');
                    let sectionTitle = document.createElement('h3');
            let articlesList = articlesToElementList(sectionData.articles);
        sectionTitle.innerText = sectionData.pathTitle;
        sectionHeader.appendChild(sectionTitle);
        sectionButton.appendChild(sectionHeader);

        //console.log(sectionData.articles);
        sectionButton.articles = sectionData.articles;
        sectionButton.articleElementListContainer = articlesList;
        sectionButton.addEventListener('click', loadIconsForArticles);
        sectionButton.addEventListener('click', toggleSkillSection);

        section.appendChild(sectionButton);
        section.appendChild(articlesList);
        sectionsList.appendChild(section);
    })
    sectionsList.classList.add('skill__sections__list');
    return sectionsList;
}

function articlesToElementList(articles) {

    let articlesList = document.createElement('div');

    articles.forEach((articleData) => {
        let article = document.createElement('div');
        article.classList.add('skill__article');
        article.classList.add('skill__article__close');
            let articleButton = document.createElement('div');
            articleButton.classList.add('skill__article__button');
            articleButton.articleData = articleData;
                let articleHeader = document.createElement('div');
                articleHeader.classList.add('skill__article__header')
                    let articleTitle = document.createElement('h4');
                    articleTitle.classList.add('skill__article__title');
                    let articleIcons = document.createElement('div');
                    articleIcons.classList.add('skill__article__icons');
                        let articleIcon = document.createElement('i');
                        articleIcon.classList.add('skill__article__icon');
            // let articleContent = document.createElement('div');
            // articleContent.classList.add('skill__article__content');
        articleTitle.innerText = articleData.pathTitle;
        articleHeader.appendChild(articleTitle);
        articleHeader.appendChild(articleIcons);
        articleIcons.appendChild(articleIcon);
        articleButton.appendChild(articleHeader);
        articleButton.addEventListener('click', toggleSkillArticle);
        article.appendChild(articleButton);
        // article.appendChild(articleContent);
        articlesList.appendChild(article);
    })
    articlesList.classList.add('skill__articles__list');
    return articlesList;
}

/*==================== TOGGLE SKILL HEADER & BOOK */

let skill_category_headers = document.querySelectorAll('.skill__category__header')

skill_category_headers.forEach((el) => {
    el.addEventListener('click', toggleSkillType)
})

function toggleSkillType(){
    const skill_categories = document.getElementsByClassName('skill__category')
    let itemClass = this.parentNode.className
    
    // for(i = 0; i < skill_categories.length; i++){
    //     skill_categories[i].className = 'skill__category skill__category__close'
    // }
    if(itemClass === 'skill__category skill__category__close'){
        this.parentNode.className = 'skill__category skill__category__open'
    }
    if(itemClass === 'skill__category skill__category__open'){
        this.parentNode.className = 'skill__category skill__category__close'
    }
    // this.scrollIntoView({block: 'start'});
}

function toggleSkill(){
    // const skill_data = document.getElementsByClassName('skill');
    let itemClass = this.parentNode.className;

    // for(i = 0; i < skill_data.length; i++){
    //     skill_data[i].className = 'skill skill__close'
    // }
    
    if(itemClass === 'skill skill__close'){
        this.parentNode.className = 'skill skill__open'
    }
    if(itemClass === 'skill skill__open'){
        this.parentNode.className = 'skill skill__close'
    }

    // Load article header data if book depth is root...

   // this.parentNode.scrollIntoView({behavior: "smooth", block: 'start'});
}

function toggleSkillPart(){
    // const skill_data = document.getElementsByClassName('skill__part');
    let itemClass = this.parentNode.className;

    // for(i = 0; i < skill_data.length; i++){
    //     skill_data[i].className = 'skill skill__close'
    // }
    
    if(itemClass === 'skill__part skill__part__close'){
        this.parentNode.className = 'skill__part skill__part__open'
    }
    if(itemClass === 'skill__part skill__part__open'){
        this.parentNode.className = 'skill__part skill__part__close'
    }
    

   // this.parentNode.scrollIntoView({behavior: "smooth", block: 'start'});
}

function toggleSkillSection(){
    // const skill_data = document.getElementsByClassName('skill__part');
    let itemClass = this.parentNode.className;

    // for(i = 0; i < skill_data.length; i++){
    //     skill_data[i].className = 'skill skill__close'
    // }
    
    if(itemClass === 'skill__section skill__section__close'){
        this.parentNode.className = 'skill__section skill__section__open'
        // Load article header data if book depth is section...
    }
    if(itemClass === 'skill__section skill__section__open'){
        this.parentNode.className = 'skill__section skill__section__close'
    }
    
    //

   // this.parentNode.scrollIntoView({behavior: "smooth", block: 'start'});
}

async function toggleSkillArticle(event){
    // const skill_data = document.getElementsByClassName('skill__part');
    let itemClass = this.parentNode.className;


    // for(i = 0; i < skill_data.length; i++){
    //     skill_data[i].className = 'skill skill__close'
    // }
    
    if(itemClass === 'skill__article skill__article__close'){
        this.parentNode.className = 'skill__article skill__article__open'
    }
    if(itemClass === 'skill__article skill__article__open'){
        this.parentNode.className = 'skill__article skill__article__close'
    } 

    // // Auto Mode 
    // if (event.currentTarget.articleData.hasYAML === false) {
    //     // Show all file names in the article and the content
    //     // for each of the files.
    //     let ha = document.createElement('h2');
    //     ha.innerText = "No Readme";
    //     this.parentNode.appendChild(ha); 
    // }
    // // Manual Mode
    // if (event.currentTarget.articleData.hasYAML === true) {

    //     let url = "https://api.github.com/repos/edwinguerrerotech/spell-book/contents/frontend/03. JavaScript/05. Scripture | Manual Snippet With 1 File and No Tree/README.md";
    //     const response = await fetch(url);
    //     const result = await response.json();
    //     readmeText = atob(result.content);
    //     // console.log(readmeText);

    //     let ha = document.createElement('h2');
    //     ha.innerText = readmeText;
    //     this.parentNode.appendChild(ha);
    // }
}

/*================================ SKILL README */




// Call a load function first, then parse, and finally render.
// Load means that, not only has the DOM structure been built, but all resources 
//  are available for use.
// Change this to parseArticleIcons.
// Parse means the act of reading/processing. In this case it's first downloading 
//  and reading data, and then create HTML.
function loadIconsForArticles(event) {

    // let articles = event.currentTarget.articles;
    // let childNodes = event.currentTarget.articleElementListContainer.childNodes;
    // // let index = 0;
    // // for (const article of childNodes) {
    // //     // Reset icons in this article element.
    // //             // article > articleButton > articleHeader > title | icons
    // //     let icons = article.firstChild.firstChild.lastChild;
    // //     //while (icons.firstChild) { icons.removeChild(icons.firstChild); }
    // //     // Render icons //////////////////////////
    // //     // If article has YAML file, parse it.
    // //     let articleData = articles[index++];
    // //     console.log(articleData)
    // //     console.log(articleData.path)
    // //     renderIcons(articleData, icons);
        
    // // }

    // for (article of articles) {
    //     //console.log(article.path + '\n')
    // }
}

// Render means to make visible and usable. Allocate space in the HTML document
//  for the element and it's content, then display that content.
async function renderIcons(articleData, icons) {
    
    if (articleData.hasYAML) {
        console.log(articleData.path)
        let url = `https://api.github.com/repos/edwinguerrerotech/spell-book/contents/${articleData.path}/config.yml`;
        const response = await fetch(url);
        const result = await response.json();
        //let data = atob(result.content);
        //console.log(result.content)
        // Parser in assets/js/js-yaml.min.js 
        //  from https://github.com/shockey/js-yaml-browser
        // let yaml = jsyaml.load(data);

        // // Render icons
        // if(yaml.icons.github){
        //     let icon = document.createElement('i');
        //     icon.classList.add('uil');
        //     icon.classList.add('uil-github');
        //     icons.appendChild(icon);
        // }
        // if(yaml.icons.youtube){
        //     let icon = document.createElement('i');
        //     icon.classList.add('uil');
        //     icon.classList.add('uil-youtube');
        //     icons.appendChild(icon);
        // }
        // if(yaml.icons.blogger){
        //     let icon = document.createElement('i');
        //     icon.classList.add('uil');
        //     icon.classList.add('uil-blogger');
        //     icons.appendChild(icon);
        // }
    }
}























/*==================== QUALIFICATION TABS ====================*/
const tabs = document.querySelectorAll('[data-target]'),
tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.target)
        
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('qualification__active')
        })
        target.classList.add('qualification__active')
        
        tabs.forEach(tab => {
            tab.classList.remove('qualification__active')
        })
        tab.classList.add('qualification__active')
    })
})

/*==================== SERVICES MODAL ====================*/
const modalViews = document.querySelectorAll('.services__modal'),
      modalBtns = document.querySelectorAll('.services__button'),
      modalCloses = document.querySelectorAll('.services__modal-close')

let modal = function(modalClick){
    modalViews[modalClick].classList.add('active-modal')
}

modalBtns.forEach((modalBtn, i) => {
    modalBtn.addEventListener('click', () => {
        modal(i)
    })
})

modalCloses.forEach((modalClose) => {
    modalClose.addEventListener('click', () => {
        modalViews.forEach((modalView) => {
            modalView.classList.remove('active-modal')
        })
    })
})

/*==================== PORTFOLIO SWIPER  ====================*/
let swiperPortfolio = new Swiper('.portfolio__container', {
    cssMode: true,
    loop: false,

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
})

/*==================== TESTIMONIAL ====================*/
let swiperTestimonial = new Swiper('.testimonial__container', {
    loop: true,
    grabCursor: true,
    spaceBetween: 48,

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
    },
    breakpoints: {
        568: {
            slidesPerView: 2,
        },
    }
})


/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight
        const sectionTop = current.offsetTop - 50;
        sectionId = current.getAttribute('id')

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/*==================== CHANGE BACKGROUND HEADER ====================*/ 
function scrollHeader(){
    const nav = document.getElementById('header');
    if(this.scrollY >= 80) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader)

/*==================== SHOW SCROLL TOP ====================*/ 
function scrollTop(){
    let scrollTop = document.getElementById('scroll-top');
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if(this.scrollY >= 200) scrollTop.classList.add('show-scroll'); else scrollTop.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollTop)

/*==================== DARK LIGHT THEME ====================*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'uil-sun'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun'

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'uil-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})