// COCO category IDs (not the contiguous 80-class YOLO indices).
// Entry thresholds reject new guesses; lower tracking thresholds only continue existing boxes.
// Linger applies only when a class has no current accepted detections.
export const ITEMS = {
 apple: { id: 53, label: 'Apples', color: '#ff5964', image: 'media/heb-apple.jpg', threshold: .48, trackingThreshold: .32, linger: 180 },
 banana: { id: 52, label: 'Bananas', color: '#ffdc42', image: 'media/heb-banana.jpg', threshold: .48, trackingThreshold: .32, linger: 180 },
 orange: { id: 55, label: 'Oranges', color: '#ffa632', image: 'media/heb-orange.jpg', threshold: .48, trackingThreshold: .32, linger: 180 },
 person: { id: 1, label: 'People', color: '#e1251b', image: 'media/people.svg', threshold: .60, trackingThreshold: .40, linger: 250 },
 car: { id: 3, label: 'Cars', color: '#78b9ef', image: 'media/car.svg', threshold: .60, trackingThreshold: .40, linger: 250 }
};
export const ENABLED = ['apple', 'banana', 'orange', 'person', 'car'];

export const GROUPS = {
 produce: { label: 'Produce', items: ['apple', 'banana', 'orange'] },
 people: { label: 'People', items: ['person'] },
 cars: { label: 'Cars', items: ['car'] }
};

// Sample presets are independent of the live camera filters.
// Images are manual inspection samples, excluded from automatic video rotation.
export const DEMOS = [
 {key:'heb-people',label:'People in Store',src:'media/heb-people.mp4',poster:'media/heb-people-poster.jpg',items:['person']},
 {key:'heb-produce',label:'Produce at Home',src:'media/heb-produce.mp4',poster:'media/heb-produce-poster.jpg',items:['apple','banana','orange']},
 {key:'add-banana',label:'Produce at Checkout',src:'media/add-banana.mp4',poster:'',items:['apple','banana','orange']},
 {key:'checkout-belt',label:'Checkout belt',src:'media/checkout-belt.mp4',poster:'',items:['apple','banana','orange']},
 {key:'curbside',label:'Curbside',src:'media/curbside.mp4',poster:'media/curbside-poster.jpg',items:['car','person']},
];
