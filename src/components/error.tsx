"use client";

import React from "react";

const ErrorPage = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-6 bg-gray-100">
			<h1 className="text-3xl font-bold text-gray-800">
				Error - Something Went Wrong
			</h1>

			<p className="text-gray-600">
				Sorry, there was an error processing your request.
			</p>
		</div>
	);
};

export default ErrorPage;
