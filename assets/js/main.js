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
const github_User = "e-guerrero";
const repo = "spell-book";
const branch = "main";
// const token = "token ";
const options = {
    method: 'GET',
    // headers: {
    //     Authorization: `token ${process.env.GITHUB_TOKEN}`
    // }
};

fetch(`https://api.github.com/repos/${github_User}/${repo}/git/trees/${branch}?recursive=1`, options)
    .then(response => {
        if(!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        } 
        else { 
            return response.json();
        }
    })
    .then(result => {
        let parsedSkills = parseSkillTree(result.tree);
        return parsedSkills;
    })
    .then(parsedSkills => {
        parsedSkills.forEach(skill => {
            let skillDiv = skillToDiv(skill);
            // Add the element to webpage+
            let skillList = document.getElementById('skill-list-' + skill.pathCategory);
            skillList.appendChild(skillDiv);
        })
    })
    .catch(err => {
        console.log(err);
        let frontendError = document.createElement('h5');
        frontendError.style.maxWidth = "300px";
        let backendError = document.createElement('h5');
        let designError = document.createElement('h5');
        let errorText = err;
        //let splitError = errorText.search(")");
        //errorText = splitError[0];

        frontendError.innerText = errorText;
        backendError.innerText = errorText;
        designError.innerText = errorText;
        // Add the element to webpage+
        let frontend = document.getElementById('skill-list-frontend');
        let backend = document.getElementById('skill-list-backend');
        let design = document.getElementById('skill-list-design');
        frontend.appendChild(frontendError);
        backend.appendChild(backendError);
        design.appendChild(designError);
    });

class Skill {
      
    constructor() {
        this._pathSkill = "";
        this._pathCategory = ""; // backend, frontend, design ....
        this._parts = [];
        this._sections = [];
        this._articles = [];
        this._articleCount = 0; 
        this._totalArticleCount = 0;
    }   

    set pathSkill(pathSkill) { this._pathSkill = pathSkill; }
    set pathCategory(pathCategory) { this._pathCategory = pathCategory; }

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
    get bookTreeDepth() { 
        if (this._parts.length > 0) { return 3; }
        else if (this._sections.length > 0) { return 2; }
        else { return 1; }
    }
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
        this._path = path; // frontend/01. HTML/
        this._pathTitle = pathTitle; // 01. Article | Auto With 1 File and No Tree
        this._hasYAML = false;
        this._files_1stLevel = [];
        this._hasTree = false;
        this._yaml = null;
    }
    get path() { return this._path }
    get pathTitle() { return this._pathTitle }
    get pathFull() { return this._path + this._pathTitle }
    get files_1stLevel() { return this._files_1stLevel }
    get hasTree() { return this._hasTree }

    set hasTree(hasTree) { this._hasTree = hasTree; }

    set hasYAML(hasYAML) { this._hasYAML = hasYAML; }
    get hasYAML() { return this._hasYAML; }
    get githubURL() {
        let base = `https://github.com/${github_User}/${repo}/tree/${branch}/`;
        let githubURL = base + encodeURIComponent(this.pathFull);
        return githubURL;
    }
    set yaml(yaml) { this._yaml = yaml; }
    get yaml() { return this._yaml; }
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
                if (bookTreeDepth === 1) {
                    parsedSkillBook = parseBook_1LevelDeep(book_branches);
                }
                else if (bookTreeDepth === 2) {
                    parsedSkillBook = parseBook_2LevelsDeep(book_branches);
                }
                else if (bookTreeDepth === 3) {
                    parsedSkillBook = parseBook_3LevelsDeep(book_branches);
                }
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

    let book = new Skill();
    book.pathCategory = category;
    book.pathSkill = skill;
    book.totalArticleCount = maxTotal;
    
    let articleCount = 0;
    // Iterate through the whole tree that belongs to this one skill book.
    for (i = 0; i < tree.length; i++) {
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
        }
        // Check for config.yml and 1-level deep files.
        else if(fullPath.length === 4){
            if (fullPath[3].search('config.yml') >= 0 || fullPath[3].search('config.yaml') >= 0) {
                book.articles[book.articles.length-1].hasYAML = true;
            }
            if (fullPath[3].search('config.yml') < 0 && fullPath[3].search('config.yaml') < 0) {
                // If it has a file extension then it's a file.
                if (fullPath[3].indexOf('.') >= 0) {
                    book.articles[book.articles.length-1].files_1stLevel.push(branch.path);
                }
            }
            
        }
        else if(fullPath.length === 5){
            book.articles[book.articles.length-1].hasTree = true;
        }
    }
    book.articleCount = articleCount;

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

    let book = new Skill();
    book.pathCategory = category;
    book.pathSkill = skill;
    book.totalArticleCount = maxTotal;

    // Iterate through the whole tree that belongs to this one skill book.
    let articleCount = 0;
    let section = "";
    let directory = "";
    let sectionIndex = null;
    let articleIndex = null;
    for (i = 0; i < tree.length; i++) {
        // Get the full path.
        let branch = tree[i];
        let fullPath = branch.path.split("/");
        // Get section and directory.
        if(fullPath.length === 3) {
            section = fullPath[2];
            directory = category + '/' + skill + '/' + section + '/';
            book.sections.push(new Section(section));
            sectionIndex = book.sections.length-1;
        }
        // Get article title
        else if (fullPath.length === 4) {
            let article = fullPath[3];
            book.sections[sectionIndex].articles.push(new Article(directory, article));
            articleIndex = book.sections[sectionIndex].articles.length-1;
            articleCount++;
        }

        // Check for config.yml and 1-level deep files.
        else if(fullPath.length === 5){
            if (fullPath[4].search('config.yml') >= 0 || fullPath[4].search('config.yaml') >= 0) {
                book.sections[sectionIndex].articles[articleIndex].hasYAML = true;
            }
            if (fullPath[4].search('config.yml') < 0 && fullPath[4].search('config.yaml') < 0) {
                // If it has a file extension then it's a file.
                if (fullPath[4].indexOf('.') >= 0) {
                    book.sections[sectionIndex].articles[articleIndex].files_1stLevel.push(branch.path);
                }
            }
            
        }
        else if(fullPath.length === 6){
            book.sections[sectionIndex].articles[articleIndex].hasTree = true;
        }
    }
    book.articleCount = articleCount;

    return book;
}

function parseBook_3LevelsDeep(tree) {
    // Trim the tree.
    let categoryAndSkillBranch = tree.shift(); // Remove 1st element
    let maxTotalBranch = tree.pop(); // Remove last element

    let path = categoryAndSkillBranch.path.split("/");
    let category = path[0];
    let skill = path[1];
    path = maxTotalBranch.path.split("/");
    let maxTotal = path[2].match(/\d+/g)[0]; // match() returns an array of matches.

    let book = new Skill();
    book.pathCategory = category;
    book.pathSkill = skill;
    book.totalArticleCount = maxTotal;

    // Iterate through the whole tree that belongs to this one skill book.
    let articleCount = 0;
    let part = "";
    let section = "";
    let directory = "";
    let partIndex = null;
    let sectionIndex = null;
    let articleIndex = null;
    for (i = 0; i < tree.length; i++) {        
        // Get the full path.
        let branch = tree[i];
        let fullPath = branch.path.split("/");
        // Get part.
        if(fullPath.length === 3) {
            part = fullPath[2];
            book.parts.push(new Part(part));
            partIndex = book.parts.length-1;
        }
        // Get section and directory.
        else if(fullPath.length === 4) {
            section = fullPath[3];
            directory = category + '/' + skill + '/' + part + '/' + section + '/';
            book.parts[partIndex].sections.push(new Section(section));
            sectionIndex = book.parts[partIndex].sections.length-1;
        }
        // Get article title
        else if (fullPath.length === 5) {
            let article = fullPath[4];
            book.parts[partIndex].sections[sectionIndex].articles.push(new Article(directory, article));
            articleIndex = book.parts[partIndex].sections[sectionIndex].articles.length-1;
            articleCount++;
        }
        // Check for config.yml and 1-level deep files.
        else if(fullPath.length === 6){
            if (fullPath[5].search('config.yml') >= 0 || fullPath[5].search('config.yaml') >= 0) {
                book.parts[partIndex].sections[sectionIndex].articles[articleIndex].hasYAML = true;
            }
            if (fullPath[5].search('config.yml') < 0 && fullPath[5].search('config.yaml') < 0) {
                // If it has a file extension then it's a file.
                if (fullPath[5].indexOf('.') >= 0) {
                    book.parts[partIndex].sections[sectionIndex].articles[articleIndex].files_1stLevel.push(branch.path);
                }
            }
            
        }
        else if(fullPath.length === 7){
            book.parts[partIndex].sections[sectionIndex].articles[articleIndex].hasTree = true;
        }
    }
    book.articleCount = articleCount;

    return book;
}

/*================================ GENERATE SKILL BUTTON/s */

function skillToDiv(skillData) {

    //  Skill container
    let skillDiv = document.createElement('div');
    skillDiv.className = 'skill skill__close';

        // Skill button
        let skillButton = document.createElement('div');
        skillButton.className = 'skill__button';

            //  Header container
            let header = document.createElement('div');
            header.classList.add('skill__header');

                // Skill name
                let title = document.createElement('h3');
                title.classList.add('skill__title');
                title.innerText = skillData.pathSkill;

                // Icons container
                let iconsContainer = document.createElement('div');
                iconsContainer.classList.add('skill__icons__container')

                    // Skill percentage
                    let percentage = document.createElement('span');
                    percentage.classList.add('skill__percentage');
                    percentage.innerText = skillData.percentage;
                    // Skill arrow icon
                    let arrow = document.createElement('i');
                    arrow.classList.add('uil');
                    arrow.classList.add('uil-angle-down');
                    arrow.classList.add('skill__arrow');

            //  Skill bar container
            let progressBar = document.createElement('div');
            progressBar.classList.add('skill__progress__bar');
            
                // Skill bar fill
                let progress = document.createElement('span');
                progress.classList.add('skill__progress');
                progress.style.width = skillData.percentage;
            
        // Skill book container (hidden while closed).
        let book = document.createElement('div');
        book.classList.add('skill__book');
    
    iconsContainer.appendChild(percentage);
    iconsContainer.appendChild(arrow);

    header.appendChild(title);
    header.appendChild(iconsContainer);

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
        // Data to pass over to the event handler to load icons...
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

        let partDiv = document.createElement('div');
        partDiv.classList.add('skill__part');
        partDiv.classList.add('skill__part__close');

            let partHeader = document.createElement('div');
            partHeader.classList.add('skill__part__header');

                let partTitle = document.createElement('h3');
                partTitle.classList.add('skill__part__title');
                partTitle.innerText = partData.pathTitle;

                let arrow = document.createElement('i');
                arrow.classList.add('uil');
                arrow.classList.add('uil-angle-down');
                arrow.classList.add('skill__part__arrow');

            let sectionsList = sectionsToButtonList(partData.sections);

        partHeader.appendChild(partTitle);
        partHeader.appendChild(arrow);
        partHeader.addEventListener('click', toggleSkillPart);

        partDiv.appendChild(partHeader);
        partDiv.appendChild(sectionsList);

        partsList.appendChild(partDiv);
    })
    return partsList;
}

function sectionsToButtonList(sections) {
    let sectionsList = document.createElement('div');

    sections.forEach((sectionData) => {

        let sectionDiv = document.createElement('div');
        sectionDiv.classList.add('skill__section');
        sectionDiv.classList.add('skill__section__close');

            let sectionHeader = document.createElement('div');
            sectionHeader.classList.add('skill__section__header');

                let sectionTitle = document.createElement('h3');
                sectionTitle.innerText = sectionData.pathTitle;

                let arrow = document.createElement('i');
                arrow.classList.add('uil');
                arrow.classList.add('uil-angle-down');
                arrow.classList.add('skill__section__arrow');

            let articlesList = articlesToElementList(sectionData.articles);

        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(arrow);

        sectionHeader.articles = sectionData.articles;
        sectionHeader.articleElementListContainer = articlesList;
        sectionHeader.addEventListener('click', loadIconsForArticles);
        sectionHeader.addEventListener('click', toggleSkillSection);

        sectionDiv.appendChild(sectionHeader);
        sectionDiv.appendChild(articlesList);

        sectionsList.appendChild(sectionDiv);
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
            //articleButton.articleData = articleData;
                let articleHeader = document.createElement('div');
                articleHeader.classList.add('skill__article__header')
                    let articleTitle = document.createElement('h4');
                    articleTitle.classList.add('skill__article__title');
                    let articleIcons = document.createElement('div');
                    articleIcons.classList.add('skill__article__icons');
                        // let articleIcon = document.createElement('i');
                        // articleIcon.classList.add('skill__article__icon');
            // let articleContent = document.createElement('div');
            // articleContent.classList.add('skill__article__content');
        articleTitle.innerText = articleData.pathTitle;
        articleHeader.appendChild(articleTitle);
        articleHeader.appendChild(articleIcons);
        //articleIcons.appendChild(articleIcon);
        articleButton.appendChild(articleHeader);
        // articleButton.addEventListener('click', toggleSkillArticle);
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
    let thisNode = this.parentNode;
    let itemClass = thisNode.className;
    console.log("Toggle Skill: " + itemClass);

    // for(i = 0; i < skill_data.length; i++){
    //     skill_data[i].className = 'skill skill__close'
    // }
    
    if(itemClass === 'skill skill__close'){
        thisNode.className = 'skill skill__open'
    }
    if(itemClass === 'skill skill__open'){
        thisNode.className = 'skill skill__close'
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

function toggleSkillArticle(event){
    /* 
        Node chain: 
            Parent chain: icons/header/button/article/ 
            This node: /icon     
    */
    let articleNode = this.parentNode.parentNode.parentNode.parentNode;
    let articleContent = document.createElement('div');
    articleContent.className = "skill__article__content";

    if(articleNode.className === 'skill__article skill__article__close'){
        articleNode.className = 'skill__article skill__article__open';
        let articleData = event.currentTarget.articleData;
        // If the article doesn't already have an articleContent div (a 2nd child),
        //  then continue with adding one. In other words, if the user wants new updated data,
        //  they will need to refreesh the entire page. This is to help reduce number of calls.
        if(articleNode.children.length < 2) {
            // If there's multiple files (does not include whether or not there's a tree).
            if (articleData.files_1stLevel.length >= 1) {

                articleData.files_1stLevel.forEach(file => {
                    let text = document.createElement('h4');
                    text.innerText = file + '\n\n';
                    articleContent.appendChild(text); 
                })

                // Try to get yaml data.
                try {
                    if(articleData.yaml.snippets.length > 0) {
                        let text = document.createElement('h4');
                        text.innerText = "Snippets: true \n\n";
                        articleContent.appendChild(text); 
                    }
                }catch(err) {
                    let text = document.createElement('h4');
                    text.innerText = 'Snippets: false \n\n';
                    articleContent.appendChild(text); 
                }

                // If this article has a tree.
                if (articleData.hasTree) {
                    let text = document.createElement('h4');
                    text.innerText = 'Has Tree: true \n\n';
                    articleContent.appendChild(text); 
                }
                else {
                    let text = document.createElement('h4');
                    text.innerText = 'Has Tree: false \n\n';
                    articleContent.appendChild(text); 
                }

                articleNode.appendChild(articleContent);
            }
        }
    }
    else if(articleNode.className === 'skill__article skill__article__open'){
        articleNode.className = 'skill__article skill__article__close';
    }   
    
}

/*================================ SKILL YAML */

// Call a load function first, then parse, and finally render.
// Load means that, not only has the DOM structure been built, but all resources 
//  are available for use.
// Change this to parseArticleIcons.
// Parse means the act of reading/processing. In this case it's first downloading 
//  and reading data, and then create HTML.
function loadIconsForArticles(event) {

    let articles = event.currentTarget.articles;
    let childNodes = event.currentTarget.articleElementListContainer.childNodes;
    let index = 0;
    for (const article of childNodes) {
        // Reset icons in this article element.
                // article > articleButton > articleHeader > title | icons
        let iconsContainer = article.firstChild.firstChild.lastChild;
        while (iconsContainer.firstChild) { 
            iconsContainer.removeChild(iconsContainer.firstChild); 
        }
        
        // Render icons //////////////////////////
        // Get the article to check if it has a YAML file and then parse it.
        let articleData = articles[index++];
        console.log(articleData)
        renderIcons(articleData, iconsContainer);

    }

}

// Render means to make visible and usable. Allocate space in the HTML document
//  for the element and it's content, then display that content.
async function renderIcons(articleData, icons) {

    // AUTO MODE
    if (articleData.hasYAML === false) {
        if (articleData.hasTree === true) {
            // create github icon
            let icon = document.createElement('i');
            icon.classList.add('skill__article__icon');
            icon.classList.add('uil');
            icon.classList.add('uil-github');
            
            let anchor = document.createElement('a');
            anchor.setAttribute('href',articleData.githubURL);
            anchor.setAttribute('target', "_blank");
            anchor.appendChild(icon);

            icons.appendChild(anchor);
        }

        try {
            // If there's snippets or if there's 1st level files, create arrow icon.
            if ((articleData.files_1stLevel.length > 0) || yaml.snippets.length > 0) {
                
                let icon = document.createElement('i');
                // icon.classList.add('skill__article__icon');
                icon.classList.add('uil');
                icon.classList.add('uil-angle-down');
                icon.classList.add('skill__article__arrow');
                icon.articleData = articleData; 
                icon.addEventListener('click', toggleSkillArticle);

                icons.appendChild(icon);
            }
        }
        catch(err) {
            //console.log(err);
        }
    }
    // MANUAL MODE
    else if (articleData.hasYAML === true) {
        let url = `https://api.github.com/repos/${github_User}/${repo}/contents/${articleData.pathFull}/config.yml/?ref=${branch}`;
        const response = await fetch(url, 
        {
            // headers: {
            //     // This only has read-only access to the public repo spell-book.
            //     authorization: token
            // }
        });
        const result = await response.json();
        let data = atob(result.content);
        // Parser in assets/js/js-yaml.min.js 
        //  from https://github.com/shockey/js-yaml-browser
        let yaml = jsyaml.load(data);
        articleData.yaml = yaml;

        try {
            if(yaml.icons.youtube){
                let icon = document.createElement('i');
                icon.classList.add('skill__article__icon');
                icon.classList.add('uil');
                icon.classList.add('uil-youtube');

                let anchor = document.createElement('a');
                anchor.setAttribute('href', yaml.icons.youtube);
                anchor.setAttribute('target', "_blank");
                anchor.appendChild(icon);

                icons.appendChild(anchor);
            }
        }
        catch(err) {
            //console.log(err);
        }
        try {
            if(yaml.icons.blogger){
                let icon = document.createElement('i');
                icon.classList.add('skill__article__icon');
                icon.classList.add('uil');
                icon.classList.add('uil-blogger');

                let anchor = document.createElement('a');
                anchor.setAttribute('href', yaml.icons.blogger);
                anchor.setAttribute('target', "_blank");
                anchor.appendChild(icon);

                icons.appendChild(anchor);
            }
        }
        catch(err) {
            //console.log(err);
        }
        try {
            if ((articleData.hasTree === true) || yaml.snippets.length > 0) {
                
                let icon = document.createElement('i');
                icon.classList.add('skill__article__icon');
                icon.classList.add('uil');
                icon.classList.add('uil-github');

                let anchor = document.createElement('a');
                anchor.setAttribute('href',articleData.githubURL);
                anchor.setAttribute('target', "_blank");
                anchor.appendChild(icon);

                icons.appendChild(anchor);
            }
        }
        catch(err) {
            //console.log(err);
        }
        try {
            // If there's snippets or if there's 1st level files, create arrow icon.
            if ((articleData.files_1stLevel.length > 0) || yaml.snippets.length > 0) {
                if(yaml.displayContent != false) {
                    let icon = document.createElement('i');
                    // icon.classList.add('skill__article__icon');
                    icon.classList.add('uil');
                    icon.classList.add('uil-angle-down');
                    icon.classList.add('skill__article__arrow');
                    icon.articleData = articleData; 
                    icon.addEventListener('click', toggleSkillArticle);
    
                    icons.appendChild(icon);
                }   
            }
        }
        catch(err) {
            //console.log(err);
        }

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