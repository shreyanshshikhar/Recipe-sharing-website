const model = require('../models/database');
const Category = require('../models/category');
const Recipe = require('../models/Recipe');

exports.homepage = async(req, res) => {
    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
        const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
        const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
        const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);
        const food = { latest, thai, american, chinese };

        res.render('index', { title: 'HomePage', categories, food });


    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occured" });
    }
};
//categories get
exports.exploreCategories = async(req, res) => {
    try {
        const limitNumber = 20;
        const categories = await Category.find({}).limit(limitNumber);

        // Filter out duplicates based on category name
        const uniqueCategories = Array.from(new Set(categories.map(category => category.name)));

        // Fetch the unique category objects
        const uniqueCategoryObjects = uniqueCategories.map(categoryName => categories.find(category => category.name === categoryName));

        res.render('categories', { title: 'Categories', categories: uniqueCategoryObjects });

    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }
};


//Categories By Id

exports.exploreCategoriesById = async(req, res) => {
    try {
        let categoryId = req.params.id;
        const limitNumber = 20;
        const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
        res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById });
    } catch (error) {
        res.satus(500).send({ message: error.message || "Error Occured" });
    }
}

//get recipe
exports.exploreRecipe = async(req, res) => {
    try {
        let recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);
        res.render('recipe', { title: 'Cooking Blog - Recipe', recipe });
    } catch (error) {
        res.satus(500).send({ message: error.message || "Error Occured" });
    }
};
exports.searchRecipe = async(req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find({ $text: { $search: searchTerm, $diacriticSensitive: true } });
        res.render('search', { title: 'Cooking Blog - Search', recipe });
    } catch (error) {
        res.satus(500).send({ message: error.message || "Error Occured" });
    }

}
exports.exploreLatest = async(req, res) => {
    try {
        const limitNumber = 20;
        const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
        res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe });
    } catch (error) {
        res.satus(500).send({ message: error.message || "Error Occured" });
    }
}
exports.exploreRandom = async(req, res) => {
    try {
        // 1. Count the total number of documents in the 'Recipe' collection
        let count = await Recipe.find().countDocuments();

        // 2. Generate a random number within the range of available recipes
        let random = Math.floor(Math.random() * count);

        // 3. Retrieve a random recipe using the generated random number
        let recipe = await Recipe.findOne().skip(random).exec();

        // 4. Render the 'explore-random' view and pass the random recipe to the view
        res.render('explore-random', { title: 'Cooking Blog - Explore Latest', recipe });
    } catch (error) {
        // 5. Handle errors by sending a 500 Internal Server Error response
        res.status(500).send({ message: error.message || "Error Occurred" });
    }
};
exports.submitRecipe = async(req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj });
}
exports.submitRecipeOnPost = async(req, res) => {
    try {

        let imageUploadFile;
        let uploadPath;
        let newImageName;

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No Files where uploaded.');
        } else {

            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;

            uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

            imageUploadFile.mv(uploadPath, function(err) {
                if (err) return res.satus(500).send(err);
            })

        }

        const newRecipe = new Recipe({
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            ingredients: req.body.ingredients,
            category: req.body.category,
            image: newImageName
        });

        await newRecipe.save();

        req.flash('infoSubmit', 'Recipe has been added.')
        res.redirect('/submit-recipe');
    } catch (error) {
        // res.json(error);
        req.flash('infoErrors', error.message);
        res.redirect('/submit-recipe');
    }
}

/*async function insertDummyCategoryData() {
    try {
        await Category.insertMany([{
                "name": "Thai",
                "image": "thai-food.jpg"
            },
            {
                "name": "American",
                "image": "american-food.jpg"
            },
            {
                "name": "Chinese",
                "image": "chinese-food.jpg"
            },
            {
                "name": "Mexican",
                "image": "mexican-food.jpg"
            },
            {
                "name": "Indian",
                "image": "indian-food.jpg"
            },
            {
                "name": "Spanish",
                "image": "spanish-food.jpg"
            }
        ]);
        console.log('Dummy category data inserted successfully');
    } catch (error) {
        console.error('Error inserting dummy category data:', error);
    }
}

insertDummyCategoryData();

// Rest of the code remains the same
async function insertDummyRecipeData() {
    try {
        const Recipe = require('../models/Recipe'); // Import the Recipe model
        await Recipe.insertMany([{
                name: 'Thai Chinese-Inspired Pinch Salad',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Cucumber, thinly sliced',
                    'Carrot, julienned',
                    'Red bell pepper, thinly sliced',
                    'Fresh cilantro, chopped',
                    'Roasted peanuts, crushed',
                    'Sesame seeds',
                    'Thai dressing (lime juice, fish sauce, soy sauce, sugar)',
                ],
                category: 'Thai',
                image: 'thai-chinese-inspired-pinch-salad.jpg',
            },
            {
                name: 'Thai Green Curry',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Chicken thighs, sliced',
                    'Coconut milk',
                    'Green curry paste',
                    'Thai eggplant, sliced',
                    'Bamboo shoots',
                    'Kaffir lime leaves',
                    'Thai basil leaves',
                    'Fish sauce',
                    'Palm sugar',
                    'Green chili, sliced (optional for extra heat)',
                ],
                category: 'Thai',
                image: 'thai-green-curry.jpg',
            },
            {
                name: 'Thai-Inspired Vegetable Broth',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Vegetable broth',
                    'Galangal, sliced',
                    'Lemongrass stalks, crushed',
                    'Kaffir lime leaves',
                    'Garlic, minced',
                    'Thai bird chilies, sliced (adjust to taste)',
                    'Coriander stems',
                    'Shiitake mushrooms, sliced',
                    'Carrot, sliced',
                    'Snow peas',
                ],
                category: 'Thai',
                image: 'thai-inspired-vegetable-broth.jpg',
            },
            {
                name: 'Thai Red Chicken Soup',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Chicken breasts, thinly sliced',
                    'Red curry paste',
                    'Coconut milk',
                    'Chicken broth',
                    'Fish sauce',
                    'Lime juice',
                    'Sugar',
                    'Cherry tomatoes, halved',
                    'Baby spinach',
                    'Cilantro, chopped',
                ],
                category: 'Thai',
                image: 'thai-red-chicken-soup.jpg',
            },
            {
                name: 'Thai-Style Mussels',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Fresh mussels, cleaned',
                    'Coconut milk',
                    'Red curry paste',
                    'Kaffir lime leaves',
                    'Fish sauce',
                    'Palm sugar',
                    'Thai basil leaves',
                    'Bird eye chilies, sliced',
                    'Garlic, minced',
                    'Lime wedges for serving',
                ],
                category: 'Thai',
                image: 'thai-style-mussels.jpg',
            },
            {
                name: 'Tom Daley',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Tomatoes, diced',
                    'Cucumbers, diced',
                    'Red onion, finely chopped',
                    'Fresh parsley, chopped',
                    'Feta cheese, crumbled',
                    'Kalamata olives, pitted and sliced',
                    'Olive oil',
                    'Red wine vinegar',
                    'Dried oregano',
                    'Salt and pepper to taste',
                ],
                category: 'Thai', // Adjust category based on the actual cuisine
                image: 'tom-daley.jpg',
            },
            {
                name: 'Veggie Pad Thai',
                description: 'Your description here...',
                email: 'your@email.com',
                ingredients: [
                    'Rice noodles',
                    'Firm tofu, diced',
                    'Bean sprouts',
                    'Green onions, sliced',
                    'Garlic, minced',
                    'Tamarind paste',
                    'Soy sauce',
                    'Palm sugar',
                    'Crushed peanuts',
                    'Lime wedges',
                ],
                category: 'Thai',
                image: 'veggie-pad-thai.jpg',
            },
        ]);
        console.log('Dummy recipe data inserted successfully');
    } catch (error) {
        console.error('Error inserting dummy recipe data:', error);
    }
}
insertDummyRecipeData();*/