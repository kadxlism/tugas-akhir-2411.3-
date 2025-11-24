<?php
// Forward Vercel requests to the normal Laravel index.php
error_log("Vercel API Entry Point Hit");
require __DIR__ . '/../public/index.php'; 
