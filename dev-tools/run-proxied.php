<style>
#dev-iframe {
  border: 2px solid green;
}
</style>

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
$full_url = full_url($_SERVER);

$proxy_url = explode('/', $full_url);
array_pop($proxy_url);
$proxy_url = implode('/', $proxy_url);
$proxy_url = $proxy_url . "/ba-simple-proxy.php";
$app_url = "../www/index.html?proxy_url=$proxy_url";

// echo "<a href='../www/index.html?proxy_url=$proxy_url'>Run ChatPlusApp</a>";

echo "<iframe id='dev-iframe' width='480' height='320' src='$app_url'></iframe>";

?>


<!--
http://127.0.0.1/ChatPlusApp/dev-tools/ba-simple-proxy.php?url=http://example.com/&mode=native&send_cookies=1&send_session=0&user_agent=nada
-->