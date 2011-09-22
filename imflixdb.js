var movie_title = false,
	movie_year = false,
	amazon_box, amazon_link, amazon_title, amazon_html,
	imdb_div,
	host_a;

function createInfoBar() {
	imdb_div = document.createElement('div');
	imdb_div.innerHTML = '<span style="position: relative; left: -80px">Loading IMDb information...</span>';
	imdb_div.style.position = 'relative';
	imdb_div.style.padding = '5px';
	imdb_div.style.font = '12px Arial';
	imdb_div.style.background = '#fff';
	imdb_div.style.borderBottom = '1px solid red';
	
	document.body.insertBefore(imdb_div, document.body.firstChild);
}
createInfoBar();


function updateInfoMessage(message) {
	imdb_div.innerHTML = message;
}

function roundNumber(number, digits) {
	var multiple, roundedNumber;
	
	multiple = Math.pow(10, digits);
	roundedNumber = Math.round(number * multiple) / multiple;
	return roundedNumber;
}

try {
	movie_title = document.title.replace("Netflix: ", "");
} catch (e) {
	// tricky netflix changed their tricky ways!
	updateInfoMessage('Couldn\'t find movie\'s title! It seems like Netflix changed their pages. It will be awesome if you tell IMflixDB\'s creator to fix this - via <a href="mailto:grigory.kruglov@gmail.com?subject=IMflixDB broke!&body=Hi Grigory! Seems like Netflix formatting changed and IMflixDB wasn\'t able to find movie title for page ' + document.location.href + '. cheers!">email</a> or just <a target="_blank" href="https://chrome.google.com/extensions/detail/kalegohegmhhfcoclhompligohbijdhg">leave a comment</a>.');
	return;
}

try {
	movie_year = document.getElementsByClassName('year')[0].innerHTML.replace(/^\s+|\s+$/g, "");
} catch (e) {
	// oh noes no year! but we can live with that, maybe
}

chrome.extension.sendRequest(
	{
		'action': 'fetchIMDBInfo',
		'title': movie_title,
		'year': movie_year
	},
	function(data) {
		if (data.success) {
			host_a = document.location.host.split(".");
			if (host_a[host_a.length - 1] == "ca") {
				amazon_title = 'Amazon.ca';
				amazon_html = '<iframe src="http://rcm-ca.amazon.ca/e/cm?t=imfone06-20&o=15&p=15&l=st1&mode=dvd-ca&search=' + escape(movie_title) +  '&fc1=000000&lt1=_blank&lc1=3366FF&bg1=FFFFFF&f=ifr" marginwidth="0" marginheight="0" width="468" height="240" border="0" frameborder="0" style="border:none;" scrolling="no"></iframe>';
			} else {
				amazon_title = 'Amazon.com';
				amazon_html = '<iframe src="http://rcm.amazon.com/e/cm?t=imfone0c-20&o=1&p=15&l=st1&mode=dvd&search=' + escape(movie_title) + '&fc1=000000&lt1=&lc1=3366FF&bg1=FFFFFF&f=ifr" marginwidth="0" marginheight="0" width="468" height="240" border="0" frameborder="0" style="border:none;" scrolling="no"></iframe>';
			}
			
			var netflix_rating = roundNumber((data.rating / 10) * 5, 2);
			
			imdb_div.innerHTML = '☃ IMDb Rating: ' + data.rating + ' (' + data.votes + '). That\'s ' + netflix_rating + ' stars. <a href="' + data.imdb_link + '" target="_blank">IMDb Link</a>.<span id="showAmazonBox" style="float: right; text-decoration: underline; cursor: pointer; width: 150px">Buy this on ' + amazon_title + '</span>';
			if (!movie_year) {
				imdb_div.innerHTML = imdb_div.innerHTML + "<p style='font-size: 9pt'>Netflix changed something on this page, so we could've gotten this movie's info wrong. <a target='_blank' href='https://chrome.google.com/extensions/detail/kalegohegmhhfcoclhompligohbijdhg'>Tell the IMflixDB guy!</a>.";
			}
			
			amazon_box = document.createElement('div');
			amazon_box.style.visibility = 'hidden';
			amazon_box.style.position = 'absolute';
			amazon_box.style.width = '468px';
			amazon_box.style.height = '240px';
			amazon_box.style.right = '0px';
			amazon_box.style.top = '15px';
			amazon_box.style.padding = '10px';
			amazon_box.style.zIndex = '12345';
			amazon_box.innerHTML = amazon_html;
			
			imdb_div.appendChild(amazon_box);
			
			amazon_link = document.getElementById('showAmazonBox');
			amazon_link.onclick = function(event) {
				if (amazon_box.style.visibility == 'hidden') {
					amazon_box.style.visibility = 'visible';
					amazon_link.innerText = 'Close the ' + amazon_title + ' box';
				} else {
					amazon_box.style.visibility = 'hidden';
					amazon_link.innerText = 'Buy this on ' + amazon_title;
				}
			};
			
			return;
		}
		
		// error case
		imdb_div.innerHTML = "Could not find this title. Probably reached Google's API limit for the day! <a target='_blank' href='https://chrome.google.com/extensions/detail/kalegohegmhhfcoclhompligohbijdhg'>Tell the IMflixDB guy!</a> Or just <a href='" + document.location.href + "'>Refresh the page</a> - might work.</p>";
	}
);
