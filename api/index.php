<?php

// Vercel Zero Config requires functions to be in /api
// This file proxies requests to the Laravel application in /backend

require __DIR__ . '/../backend/public/index.php';
