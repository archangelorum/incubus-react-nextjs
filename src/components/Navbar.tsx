import Link from "next/link";
import Image from "next/image";
import React from "react";
import { auth, signIn, signOut } from "@/auth";

const Navbar = async () => {
    const session = await auth();

    return (
        <header className="px-5 py-3 bg-gray-900 shadow-md text-white font-work-sans">
            <nav className="flex justify-between items-center">
                <Link href="/">
                    <Image src="/logo.png" alt="logo" width={144} height={30} />
                </Link>

                <div className="flex items-center gap-6">
                    {session && session?.user ? (
                        <>
                            {/* Logout Form */}
                            <form action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}>
                                <button type="submit" className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200">
                                    Logout
                                </button>
                            </form>

                            {/* Profile Link */}
                            <Link href={session.user.roleId === 3 ? "/admin" : "/user"}>
                                <span className="text-lg cursor-pointer hover:text-yellow-500 transition duration-200">
                                    {session.user.name} ({session.user.roleId === 3 ? 'Admin' : 'User'})
                                </span>
                            </Link>
                        </>
                    ) : (
                        <form action={async () => {
                            "use server";
                            await signIn();
                        }}>
                            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
                                Login
                            </button>
                        </form>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
