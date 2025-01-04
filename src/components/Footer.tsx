import Link from "next/link";
import React from "react";
import { auth, signIn } from "@/auth";

const Footer = async () => {
    const session = await auth();

    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-5">
                <div className="flex justify-between items-center">
                    {/* Left Side */}
                    <div className="text-sm break-words">
                        <p>&copy; {new Date().getFullYear()} Incubus Studios. All rights reserved.</p>
                    </div>

                    {/* Center Links */}
                    <div className="flex flex-grow justify-evenly text-center space-x-4">
                        <Link href="/about" className="hover:text-gray-400 whitespace-nowrap">
                            About
                        </Link>
                        <Link href="/privacy" className="hover:text-gray-400 whitespace-nowrap">
                            Privacy Policy
                        </Link>
                        <Link href="/contact" className="hover:text-gray-400 whitespace-nowrap">
                            Contact Us
                        </Link>
                    </div>

                    {/* Right Side - User Info */}
                    <div className="text-sm text-right break-words">
                        {session && session?.user ? (
                            <p>
                                Signed in as <strong>{session.user.name}</strong> ({session.user.email})
                            </p>
                        ) : (
                            <form action={async () => {
                                "use server";
                                await signIn();
                            }}>
                                <button type="submit">
                                    Login
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
