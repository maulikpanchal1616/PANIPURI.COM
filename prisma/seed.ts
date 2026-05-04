import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const categories = [
    'North Indian',
    'South Indian',
    'Chinese',
    'Fast Food',
    'Desserts',
    'Beverages',
    'Street Food',
    'Gujarati',
    'Healthy'
  ];

  const vendorNames = [
    'Shree Krishna Kitchen',
    'Amba Dal Bati',
    'Mumbai Masala',
    'Ahmedabad Express',
    'The Healthy Bowl',
    'Royal Tandoor',
    'Pani Puri Paradise',
    'Desi Tadka',
    'Sweet Delights',
    'China Town Express',
    'South Feast',
    'Garden Grill',
    'Momos Mania',
    'Pizza Point',
    'The Burger Barn'
  ];

  const dishTemplates = {
    'North Indian': [
      { name: 'Paneer Butter Masala', price: 220, description: 'Creamy paneer in tomato gravy' },
      { name: 'Dal Makhani', price: 180, description: 'Slow cooked black lentils' },
      { name: 'Butter Naan', price: 40, description: 'Soft leavened bread with butter' },
      { name: 'Chole Bhature', price: 120, description: 'Spicy chickpeas with fried bread' },
      { name: 'Malai Kofta', price: 200, description: 'Potato cheese balls in creamy gravy' },
      { name: 'Aloo Paratha', price: 60, description: 'Stuffed potato flatbread' },
      { name: 'Jeera Rice', price: 100, description: 'Basmati rice with cumin seeds' },
      { name: 'Mix Veg', price: 160, description: 'Seasonal vegetables in spicy gravy' },
      { name: 'Kadai Paneer', price: 210, description: 'Paneer with bell peppers' },
      { name: 'Shahi Paneer', price: 230, description: 'Paneer in rich cashew gravy' }
    ],
    'South Indian': [
      { name: 'Masala Dosa', price: 90, description: 'Crispy rice crepe with potato filling' },
      { name: 'Idli Sambar', price: 60, description: 'Steamed rice cakes with lentil soup' },
      { name: 'Menduvada', price: 70, description: 'Savory fried donuts' },
      { name: 'Mysore Masala Dosa', price: 110, description: 'Spicy masala dosa' },
      { name: 'Rava Onion Dosa', price: 100, description: 'Crispy semolina crepe' },
      { name: 'Uttapam', price: 80, description: 'Thick rice pancake with toppings' },
      { name: 'Lemon Rice', price: 90, description: 'Zesty lemon flavored rice' },
      { name: 'Appam with Stew', price: 140, description: 'Lacy pancakes with coconut stew' },
      { name: 'Paniyaram', price: 70, description: 'Small steamed rice balls' },
      { name: 'Filter Coffee', price: 30, description: 'Traditional South Indian coffee' }
    ],
    'Chinese': [
      { name: 'Veg Manchurian', price: 150, description: 'Veg balls in spicy sauce' },
      { name: 'Hakka Noodles', price: 140, description: 'Stir fried noodles with veggies' },
      { name: 'Schezwan Fried Rice', price: 160, description: 'Spicy fried rice' },
      { name: 'Spring Rolls', price: 120, description: 'Crispy rolls with veg filling' },
      { name: 'Chilli Paneer', price: 180, description: 'Paneer cubes in chilli sauce' },
      { name: 'Honey Chilli Potato', price: 130, description: 'Crispy potatoes in honey sauce' },
      { name: 'Veg Fried Rice', price: 130, description: 'Classic fried rice' },
      { name: 'Gobi Manchurian', price: 140, description: 'Crispy cauliflower in sauce' },
      { name: 'Manchow Soup', price: 80, description: 'Spicy and sour soup' },
      { name: 'Triple Schezwan Rice', price: 200, description: 'Rice, noodles and gravy' }
    ],
    'Fast Food': [
      { name: 'Cheese Burger', price: 90, description: 'Classic burger with cheese' },
      { name: 'Veg Pizza', price: 180, description: 'Pizza with garden fresh veggies' },
      { name: 'French Fries', price: 70, description: 'Crispy salted potato fries' },
      { name: 'Club Sandwich', price: 110, description: 'Triple layer sandwich' },
      { name: 'Garlic Bread', price: 80, description: 'Toasted bread with garlic butter' },
      { name: 'Hot Dog', price: 90, description: 'Veg sausage in bun' },
      { name: 'Taco Veggie', price: 100, description: 'Crispy shell with beans and salad' },
      { name: 'Onion Rings', price: 60, description: 'Deep fried onion rings' },
      { name: 'Nuggets', price: 80, description: 'Veggie nuggets with dip' },
      { name: 'Pasta Arrabbiata', price: 150, description: 'Pasta in spicy red sauce' }
    ],
    'Street Food': [
      { name: 'Pani Puri', price: 40, description: 'Classic 8 pieces with spicy water' },
      { name: 'Vada Pav', price: 20, description: 'Mumbai style potato burger' },
      { name: 'Pav Bhaji', price: 100, description: 'Spiced veg mash with buttered bread' },
      { name: 'Bhel Puri', price: 50, description: 'Puffed rice savory snack' },
      { name: 'Dahi Puri', price: 60, description: 'Sweet and tangy puris' },
      { name: 'Samosa Chat', price: 70, description: 'Crushed samosa with chutneys' },
      { name: 'Kachori', price: 30, description: 'Fried pastry with spicy filling' },
      { name: 'Misal Pav', price: 90, description: 'Spicy sprouts curry with bread' },
      { name: 'Aloo Tikki', price: 50, description: 'Crispy potato patties' },
      { name: 'Dhokla', price: 40, description: 'Steamed chickpea snack' }
    ]
  };

  console.log('Seeding data...');

  for (let i = 0; i < vendorNames.length; i++) {
    const businessName = vendorNames[i];
    const email = `${businessName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    
    // Create User
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: businessName,
        email,
        password: hashedPassword,
        role: 'VENDOR',
        address: `${100 + i}, Ahmedabad Business Hub`,
        latitude: 23.0225 + (Math.random() - 0.5) * 0.1,
        longitude: 72.5714 + (Math.random() - 0.5) * 0.1,
      },
    });

    // Create Vendor
    const vendor = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName,
        description: `Authentic ${categories[i % categories.length]} cuisine from ${businessName}`,
        address: user.address!,
        latitude: user.latitude!,
        longitude: user.longitude!,
        isApproved: true,
        rating: 4 + Math.random(),
        upiId: `${email.split('@')[0]}@okaxis`,
        logoUrl: `https://picsum.photos/seed/${i}/200`,
        bannerUrl: `https://picsum.photos/seed/${i+100}/800/400`,
      },
    });

    // Create Dishes for this vendor
    const category = categories[i % categories.length];
    const dishesToCreate = dishTemplates[category as keyof typeof dishTemplates] || dishTemplates['North Indian'];

    for (const dishTemplate of dishesToCreate) {
      await prisma.dish.create({
        data: {
          vendorId: vendor.id,
          name: dishTemplate.name,
          price: dishTemplate.price,
          description: dishTemplate.description,
          category: category,
          isVeg: true,
          imageUrl: `https://picsum.photos/seed/${dishTemplate.name}/400/300`,
          isAvailable: true,
          rating: 4 + Math.random(),
          prepTime: 15 + Math.floor(Math.random() * 15),
        },
      });
    }
    
    console.log(`Created vendor ${businessName} with ${dishesToCreate.length} dishes.`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
