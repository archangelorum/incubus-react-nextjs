export default function Footer() {
    return (
        <footer className="bg-background border-t border-foreground/10">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-foreground text-lg font-semibold mb-4">Game Platform</h3>
                        <p className="text-foreground/70 text-sm">
                            Your one-stop destination for gaming excellence. Access your dashboard, manage games, and connect with the community.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-foreground text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/games" className="text-foreground/70 hover:text-foreground text-sm">
                                    Browse Games
                                </a>
                            </li>
                            <li>
                                <a href="/community" className="text-foreground/70 hover:text-foreground text-sm">
                                    Community
                                </a>
                            </li>
                            <li>
                                <a href="/support" className="text-foreground/70 hover:text-foreground text-sm">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-foreground text-lg font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/privacy" className="text-foreground/70 hover:text-foreground text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="/terms" className="text-foreground/70 hover:text-foreground text-sm">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="/cookies" className="text-foreground/70 hover:text-foreground text-sm">
                                    Cookie Policy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-foreground text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:support@gameplatform.com" className="text-foreground/70 hover:text-foreground text-sm">
                                    support@gameplatform.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+1234567890" className="text-foreground/70 hover:text-foreground text-sm">
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="text-foreground/70 text-sm">
                                123 Gaming Street<br />
                                Game City, GC 12345
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-foreground/10">
                    <p className="text-foreground/70 text-sm text-center">
                        © {new Date().getFullYear()} Game Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
} 