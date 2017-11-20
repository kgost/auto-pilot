let test = [2,3,4,5,6,7,9]

let start = 0;
let end = test.length - 1;

while ( start <= end ) {
	let mid = parseInt( ( end + start ) / 2 );

	if ( test[mid] == 1 ) {
		break;
	} else if ( test[mid] < 1 ) {
		start = mid + 1;
	} else if ( test[mid] > 1 ) {
		end = mid - 1;
	}
}

test.splice( start, 0, 1 );

console.log( test );