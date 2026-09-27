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
 {key:'expo-fruit',label:'Fruit',src:'media/expo-fruit.mp4',poster:'media/expo-fruit-poster.jpg',items:['apple','banana','orange']},
 {key:'store-people',label:'People',src:'media/store-people.mp4',poster:'media/store-people-poster.jpg',items:['person']}
];
