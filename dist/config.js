// COCO category IDs (not the contiguous 80-class YOLO indices).
export const ITEMS = {
 apple: { id: 53, label: 'Apples', color: '#ff5964', image: 'media/heb-apple.jpg', threshold: .48 },
 banana: { id: 52, label: 'Bananas', color: '#ffdc42', image: 'media/heb-banana.jpg', threshold: .48 },
 orange: { id: 55, label: 'Oranges', color: '#ffa632', image: 'media/heb-orange.jpg', threshold: .48 },
 person: { id: 1, label: 'People', color: '#766bff', image: 'media/people.svg', threshold: .60 }
};
export const ENABLED = ['apple', 'banana', 'orange', 'person'];

export const DEMOS = [
 {key:'checkout-belt',label:'Checkout belt',src:'media/checkout-belt.mp4',poster:''},
 {key:'fruit-display',label:'Fruit display',src:'media/fruit-display.mp4',poster:''},
 {key:'produce',label:'Produce',src:'media/produce.mp4',poster:'media/produce-poster.jpg'},
 {key:'checkout',label:'Checkout',src:'media/checkout.mp4',poster:'media/checkout-poster.jpg'},
 {key:'conveyor',label:'Conveyor',src:'media/conveyor.mp4',poster:'media/conveyor-poster.jpg'},
 {key:'people',label:'People',src:'media/demo.mp4',poster:'media/poster.jpg'}
];
