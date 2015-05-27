<doctype html>
<html>
<head>
<title>ChatPlus App Emulator</title>
<style>
#dev-iframe {
  border: 2px solid green;
}
</style>

<script>
var sizes = [
["computer", "1024x600x1", '10" Netbook'],
["computer", "1024x768x1", '12" Netbook'],
["computer", "1280x800x1", '13" Notebook'],
["computer", "1366x768x1", '15" Notebook'],
["computer", "1440x900x1", '19" Desktopbook'],
["computer", "1600x900x1", '20" Desktopbook'],
["computer", "1680x1050x1", '22" Desktopbook'],
["computer", "1920x1080x1", '23" Desktopbook'],
["computer", "1920x1200x1", '24" Desktopbook'],
["tablet", "533x853x24", 'Kindle Fire HD 7"'],
["tablet", "600x800x25", 'Kindle Fire'],
["tablet", "600x1024x23", 'Samsung Galaxy Tab'],
["tablet", "603x966x23", 'Google Nexus 7'],
["tablet", "768x1024x22", 'Apple iPad (All)'],
["tablet", "800x1280x24", 'Kindle Fire HD 8.9"'],
["mobile", "176x220x31", 'Motorola RAZR V3m'],
["mobile", "240x320x31", 'Motorola RAZR V8'],
["mobile", "320x240x32", 'BlackBerry 8300'],
["mobile", "320x480x33", 'Apple iPhone 3/4'],
["mobile", "320x480x34", 'LG Optimus S'],
["mobile", "320x533x34", 'Samsung Galaxy S2'],
["mobile", "320x533x36", 'ASUS Galaxy 7'],
["mobile", "320x568x37", 'Apple iPhone 5'],
["mobile", "320x640x38", 'Samsung Galaxy S3/4'],
["mobile", "360x640x39", 'Samsung Galaxy S5'],
["mobile", "375x667x37", 'Apple iPhone 6'],
["mobile", "414x736x37", 'Apple iPhone 6 Plus']
];

function changeSize(e) {
	e.preventDefault();
	var iframe = document.getElementById("dev-iframe");
	var dims = this.value.split("x");
	
	iframe.style.width = dims[0];
	iframe.style.height = dims[1];
}

function run() {
  var select = document.getElementById("size");
  select.addEventListener("click", changeSize, false);
  select.addEventListener("change", changeSize, false);
  
  sizes.forEach(function(size) {
    var dims = size[1].split("x");
	
	var w = dims[0];
	var h = dims[1];
	var dim = [w,h].join("x");
	
    var option = new Option(size[2] + " " + dim, dim);
	select.options.add(option);
  });
}

</script>

</head>
<body onload="run()">

<label>
Choose screens size
<select id="size">
</select>
</label>
<br>

<?php makeIframe(); ?>

</body>
</html>


<?php
function url_origin($s, $use_forwarded_host=false)
{
    $ssl = (!empty($s['HTTPS']) && $s['HTTPS'] == 'on') ? true:false;
    $sp = strtolower($s['SERVER_PROTOCOL']);
    $protocol = substr($sp, 0, strpos($sp, '/')) . (($ssl) ? 's' : '');
    $port = $s['SERVER_PORT'];
    $port = ((!$ssl && $port=='80') || ($ssl && $port=='443')) ? '' : ':'.$port;
    $host = ($use_forwarded_host && isset($s['HTTP_X_FORWARDED_HOST'])) ? $s['HTTP_X_FORWARDED_HOST'] : (isset($s['HTTP_HOST']) ? $s['HTTP_HOST'] : null);
    $host = isset($host) ? $host : $s['SERVER_NAME'] . $port;
    return $protocol . '://' . $host;
}
function full_url($s, $use_forwarded_host=false)
{
    return url_origin($s, $use_forwarded_host) . $s['REQUEST_URI'];
}

function makeIframe() {
$full_url = full_url($_SERVER);

$proxy_url = explode('/', $full_url);
array_pop($proxy_url);
$proxy_url = implode('/', $proxy_url);
$proxy_url = $proxy_url . "/ba-simple-proxy.php";
$app_url = "../www/index.html?proxy_url=$proxy_url";

// echo "<a href='../www/index.html?proxy_url=$proxy_url'>Run ChatPlusApp</a>";

echo "<iframe id='dev-iframe' width='480' height='320' src='$app_url'></iframe>";
}

?>



<!--
http://127.0.0.1/ChatPlusApp/dev-tools/ba-simple-proxy.php?url=http://example.com/&mode=native&send_cookies=1&send_session=0&user_agent=nada
-->