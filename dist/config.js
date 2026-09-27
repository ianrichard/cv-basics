// COCO category IDs (not the contiguous 80-class YOLO indices).
export const ITEMS = {
 apple: { id: 53, label: 'Apples', color: '#ff5964', image: 'media/heb-apple.jpg', threshold: .48 },
 banana: { id: 52, label: 'Bananas', color: '#ffdc42', image: 'media/heb-banana.jpg', threshold: .48 },
 orange: { id: 55, label: 'Oranges', color: '#ffa632', image: 'media/heb-orange.jpg', threshold: .48 },
 person: { id: 1, label: 'People', color: '#766bff', image: 'media/people.svg', threshold: .60 }
};
export const ENABLED = ['apple', 'banana', 'orange', 'person'];

// Each scene also selects the classes used by the live camera.
export const DEMOS = [
 {key:'expo-fruit',label:'Expo fruit',src:'media/expo-fruit.mp4',poster:'media/expo-fruit-poster.jpg',items:['apple','banana','orange'],note:'Expo fruit · apples, bananas and oranges'},
 {key:'store-people',label:'Supermarket',src:'media/store-people.mp4',poster:'media/store-people-poster.jpg',items:['person'],note:'Supermarket · people currently in view'},
 {key:'add-banana',label:'Add banana',src:'media/add-banana.mp4',poster:'',items:['apple','banana','orange'],note:'AI demo · add banana'},
 {key:'remove-orange',label:'Remove orange',src:'media/remove-orange.mp4',poster:'',items:['apple','banana','orange'],note:'AI demo · remove orange'},
 {key:'checkout-belt',label:'Checkout belt',src:'media/checkout-belt.mp4',poster:'',items:['apple','banana','orange'],note:'AI demo · checkout belt'},
 {key:'fruit-display',label:'Fruit display',src:'media/fruit-display.mp4',poster:'',items:['apple','banana','orange'],note:'AI demo · fruit display'}
];
