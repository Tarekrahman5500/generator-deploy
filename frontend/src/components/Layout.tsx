import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">

                <main className="flex-1 p-4">
                    <Outlet /> {/* This is where your pages render */}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
