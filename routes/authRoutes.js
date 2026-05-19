// Autentisering

// Paket
const express = require('express');
const mongoose = require('mongoose');
const router = require('router');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// För att kunna använda miljövariabler
require('dotenv').config();