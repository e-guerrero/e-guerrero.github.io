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

/*==================== ACCORDION SKILLS ====================*/

function toggleSkillCategories(){
    const skill_categories = document.getElementsByClassName('skill__category')
    let itemClass = this.parentNode.className
    
    for(i = 0; i < skill_categories.length; i++){
        skill_categories[i].className = 'skill__category skill__category__close'
    }
    if(itemClass === 'skill__category skill__category__close'){
        this.parentNode.className = 'skill__category skill__category__open'
    }
}

let skill_category_headers = document.querySelectorAll('.skill__category__header')
skill_category_headers.forEach((el) => {
    el.addEventListener('click', toggleSkillCategories)
})



function toggleSkill(){
    console.log('hello')
    const skill_data = document.getElementsByClassName('skill');
    let itemClass = this.parentNode.className;

    for(i = 0; i < skill_data.length; i++){
        skill_data[i].className = 'skill skill__close'
    }
    
    if(itemClass === 'skill skill__close'){
        this.parentNode.className = 'skill skill__open'
    }
}


/*========================= DYNAMICALLY GENERATED SKILLS =======================*/

fetch("https://api.github.com/repos/edwinguerrerotech/spell-book/git/trees/main?recursive=1")
    .then(response => {
        return response.json(); 
    })
    .then(result => {
        //console.log(result.tree)
        return getSkills(result.tree);
    })
    .then(skills => {
        skills.forEach(skill => {
            addSkillListingToPage(skill);
        })
    });




let Range = {
    startLine: 0,
    endLine: 0
}

let Snippet = {
        filePath: "",
        ranges: []
}

class Article {
    constructor(title) {
        this._title = title; // mandatory
        this._hasReadme = false;

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
    set hasReadme(hasReadme) { this._hasReadme = hasReadme; }
}

class Section {
    constructor(title) {
        this._title = title;
        this._articles = [];
    }
    get articles() { return this._articles; }
}

class Part {
    constructor(title) {
        this._title = title;
        this._sections = [];
    }

    get sections() { return this._sections; }  
    get title() { return this._title; } 
}

class Skill {
      
    constructor() {
        this._title = "";
        this._category = ""; // backend, frontend, design ....
        this._parts = [];
        this._sections = [];
        this._articles = [];
        this._bookTreeDepth = 0; // 1 - 3 Part | Section | Article
        this._articleCount = 0; 
        this._totalArticleCount = 0;
    }   

    set title(title) { this._title = title; }
    set category(category) { this._category = category; }

    set bookTreeDepth(bookTreeDepth) { this._bookTreeDepth = bookTreeDepth; }
    set articleCount(articleCount) { this._articleCount = articleCount; }
    set totalArticleCount(totalArticleCount) { this._totalArticleCount = totalArticleCount; }
    
    get title() {
    // Remove sequential numbers.
        let nameCategoryArray = this._title.split(" ");
        return nameCategoryArray[1];
    }
    get category() { return this._category; }
    get parts() { return this._parts; }
    get sections() { return this._sections; }
    get articles() { return this._articles; } 
    get percentage() { 
        return Math.round((this._articleCount / this._totalArticleCount) * 100 ) + "%"; 
    }
    get bookTreeDepth() { return this._bookTreeDepth; }
    
} 


const category_Index = 0;
const skill_Index = 1;
const level_1_Index = 2;
const level_2_Index = 3;
const level_3_Index = 4;
const level_4_Index = 5;

function parseOneCategory(tree) {
    let skill = new Skill();
    const article_Index = level_1_Index;
    const content_index = level_2_Index;
    let directoryTitle = "";
    let currentArticle = -1;
    let articleCount = 0;
    let totalArticleCount = 0;
    skill.bookTreeDepth = 1;

    tree.forEach(function(result, index) {
        splitPath = result.path.split("/");
        currentDepthIndex = splitPath.length - 1;

        if (splitPath.length === 2) {
            skill.category = splitPath[category_Index];
            skill.title = splitPath[skill_Index];
        }
        if (currentDepthIndex === article_Index) {
            directoryTitle = splitPath[article_Index];
            skill.articles.push(new Article(directoryTitle));

            // Keep count of total articles for bar percentage calculation.
            articleCount++;
        }
        if (currentDepthIndex === content_index) {
            // Check for README.md file.
            if (splitPath[level_2_Index].search("README.md") >= 0){
                currentArticle = skill.articles.length - 1;
                skill.articles[currentArticle].hasReadme = true;
            }
        }
        if (index === tree.length - 1) {
            totalArticleCount = splitPath[level_1_Index].match(/\d+/g);
        }
    })

    skill.totalArticleCount = totalArticleCount;
    skill.articleCount = articleCount;
    return skill;

}

function parseTwoCategories(tree) {
    let skill = new Skill();
    const section_Index = level_1_Index;
    const article_Index = level_2_Index;
    const content_index = level_3_Index;
    let directoryTitle = "";
    let currentSection = -1;
    let currentArticle = -1;
    let articleCount = 0;
    let totalArticleCount = 0;
    skill.bookTreeDepth = 2;

    tree.forEach(function(result, index) {
        splitPath = result.path.split("/");
        currentDepthIndex = splitPath.length - 1;

        if (splitPath.length === 2) {
            skill.category = splitPath[category_Index];
            skill.title = splitPath[skill_Index];
        }
        if (currentDepthIndex === section_Index) {
            directoryTitle = splitPath[section_Index];
            skill.sections.push(new Section(directoryTitle));
        }
        if (currentDepthIndex === article_Index) {
            directoryTitle = splitPath[article_Index];
            currentSection = skill.sections.length - 1;
            skill.sections[currentSection].articles.push(new Article(directoryTitle));

            // Keep count of total articles for bar percentage calculation.
            articleCount++;
        }
        if (currentDepthIndex === content_index) {
            // Check for README.md file.
            if (splitPath[level_2_Index].search("README.md") >= 0){
                currentArticle = skill.sections[currentSection].articles.length - 1;
                skill.sections[currentSection].articles[currentArticle].hasReadme = true;
            }
        }
        if (index === tree.length - 1) {
            totalArticleCount = splitPath[level_1_Index].match(/\d+/g);
        }
    })

    skill.totalArticleCount = totalArticleCount;
    skill.articleCount = articleCount;
    return skill;
}

function parseThreeCategories(tree) {
    let skill = new Skill();
    const part_Index = level_1_Index;
    const section_Index = level_2_Index;
    const article_Index = level_3_Index;
    const content_index = level_4_Index;
    let directoryTitle = "";
    let currentPart = -1;
    let currentSection = -1;
    let currentArticle = -1;
    let articleCount = 0;
    let totalArticleCount = 0;
    skill.bookTreeDepth = 3;

    tree.forEach(function(result, index) {
        splitPath = result.path.split("/");
        currentDepthIndex = splitPath.length - 1;

        if (splitPath.length === 2) {
            skill.category = splitPath[category_Index];
            skill.title = splitPath[skill_Index];
        }
        if (currentDepthIndex === part_Index && index != tree.length - 1) {
            directoryTitle = splitPath[part_Index];
            skill.parts.push(new Part(directoryTitle));
        }
        if (currentDepthIndex === section_Index) {
            directoryTitle = splitPath[section_Index];
            currentPart = skill.parts.length - 1;
            skill.parts[currentPart].sections.push(new Section(directoryTitle));
        }
        if (currentDepthIndex === article_Index) {
            directoryTitle = splitPath[article_Index];
            currentSection = skill.parts[currentPart].sections.length - 1;
            skill.parts[currentPart].sections[currentSection].articles.push(new Article(directoryTitle));

            // Keep count of total articles for bar percentage calculation.
            articleCount++;
        }
        if (currentDepthIndex === content_index) {
            // Check for README.md file.
            if (splitPath[level_2_Index].search("README.md") >= 0){
                currentArticle = skill.parts[currentPart].sections[currentSection].articles.length - 1;
                skill.parts[currentPart].sections[currentSection].articles[currentArticle].hasReadme = true;
            }
        }
        if (index === tree.length - 1) {
            totalArticleCount = splitPath[level_1_Index].match(/\d+/g);
        }
    })

    skill.totalArticleCount = totalArticleCount;
    skill.articleCount = articleCount;
    return skill;
}


/*================================ PARSE SKILLS ================================*/

function getSkills(wholeTree) {

    //console.log(tree);

    // Skill object
    let skill = new Skill();
    // For gradually saving all the skills.
    let results = [];
    let skills = [];
    let bookTreeDepth = 0; // 1-3
    // Path as an array of strings seperated by "/".
    let splitPath = [];
    let currentDepthIndex = 0;

    wholeTree.shift(); // trim off .gitignore
    wholeTree.shift(); // trim off README.md


    wholeTree.forEach(function(result) {
        splitPath = result.path.split("/");
        currentDepthIndex = splitPath.length - 1;

        // Don't include results that only contain the category.
        // This overcomplicates the parsing algorithms.
        if (currentDepthIndex != category_Index) {
            // Keep saving results until end of skill is reached.
            // Then take the results for each skill and parse them into skill objects.
            // Finally, push the skill objects into the skills array.
            results.push(result);
        }
   
        if (currentDepthIndex === level_1_Index) {
            // If it does not start with a digit... 
            if (splitPath[level_1_Index].match(/^\d/) ===  null) {
                // Pass the skill tree to the appropriate parser.
                if (bookTreeDepth === 1) {
                    skill = parseOneCategory(results);
                }
                else if (bookTreeDepth === 2) {
                    skill = parseTwoCategories(results);
                }
                else if (bookTreeDepth === 3) {
                    skill = parseThreeCategories(results);
                }
                skills.push(skill);
                // Reset results for the next skill.
                results = [];
            }
        }   
        if (currentDepthIndex === level_2_Index) {
            // If it does not start with a digit... 
            if (splitPath[level_2_Index].match(/^\d/) === null) {
                bookTreeDepth = 1;
            }
        } // Guaranteed to go at least this far throughout the entire life cycle of 
        //  a skill.

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

    return skills;
}

/*================================ GENERATE SKILL LISTING ================================*/


function addSkillListingToPage(skillData) {

    //  Skill container
    let skillListing = document.createElement('div');
    skillListing.className = 'skill skill__close';

        // Skill Button
        let skill__button = document.createElement('div');
        skill__button.classList.add('skill__button');

            //  Header container
            let header = document.createElement('div');
            header.classList.add('skill__header');

                // Skill name
                let title = document.createElement('h3');
                title.classList.add('skill__title');
                title.innerText = skillData.title;
                // Skill percentage
                let percentage = document.createElement('span');
                percentage.classList.add('skill__percentage');
                percentage.innerText = skillData.percentage;

            //  Skill bar container
            let skill_progress_bar = document.createElement('div');
            skill_progress_bar.classList.add('skill__progress__bar');
            
                // Skill bar fill
                let skill_progress = document.createElement('span');
                skill_progress.classList.add('skill__progress');
                skill_progress.style.width = skillData.percentage;
            
        // Skill book container
        let book = document.createElement('div');
        book.classList.add('skill__book');

    


    header.appendChild(title);
    header.appendChild(percentage);
    //skillListing.appendChild(skill_progress_bar);
    skill_progress_bar.appendChild(skill_progress);

    skill__button.appendChild(header);
    skill__button.appendChild(skill_progress_bar);

    skillListing.appendChild(skill__button);
    skillListing.appendChild(book);

    // Append the book contents to the book.
    // if (skillData.bookTreeDepth === 1) { book.appendChild(getArticles(skillData)); }
    // if (skillData.bookTreeDepth === 2) { book.appendChild(getSections(skillData)); }
    if (skillData.bookTreeDepth === 3) { book.appendChild(getParts(skillData)); }

    skill__button.addEventListener('click', toggleSkill);

    // Add the element to webpage
    let skills_list = document.getElementById('skills-list-' + skillData.category);
    skills_list.appendChild(skillListing);
}



function getParts(skillData) {

    // let blah = document.createElement('h3');
    // blah.innerText = "Parts";

    // return blah;
    
    /*
        Return a div that contains a list of h3 elements.
        Title each with part.title.
    */

    let bookContent = document.createElement('div');

    skillData.parts.forEach(part => {
        // console.log(part.title);
        let partHeader = document.createElement('div');
        let partTitle = document.createElement('h3');
        partTitle.innerText = part.title;
        partHeader.appendChild(partTitle);
    
        bookContent.appendChild(partHeader);
    })

    return bookContent;
}

function getSections(skillData) {

    let blah = document.createElement('h3');
    blah.innerText = "Sections";

    return blah;
}

function getArticles(skillData) {

    let blah = document.createElement('h3');
    blah.innerText = "Articles";

    return blah;
}







function parseReadme(skill) {
    // // Get readme file data to calculate completed percentage for each skill.

    //     let url = `https://api.github.com/repos/edwinguerrerotech/spell-book/contents/${skill.category}/${skill.title}/README.md`;
    //     const response = await fetch(url);
    //     const result = await response.json();
 
    // // parse readme file data to get count of lessons to calculate percentage.
    //     //console.log(atob(result.content));
    //     const readmeText = atob(result.content);
    //     const flag = "count: ";
    //     let flagPosition = readmeText.search(flag);
    //     countPosition = flagPosition + flag.length;
    //     const count = readmeText.slice(countPosition, readmeText.length);
    //     console.log(count);

    // Get numbers of lessons in skill directory.
    addSkillListingToPage("frontend","skill.title","skill.percentage");
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