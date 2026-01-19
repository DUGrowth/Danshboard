"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Target, CheckSquare, Rocket, Moon, Settings } from "lucide-react";

export default function NavBar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-gray-400 bg-clip-text text-transparent">
                Dan-shboard
              </span>
            </motion.div>
          </Link>

          <div className="flex items-center space-x-4">
            <NavLink href="/" icon={<Target className="h-4 w-4" />}>
              Dashboard
            </NavLink>
            <NavLink href="/routines" icon={<Moon className="h-4 w-4" />}>
              Routines
            </NavLink>
            <NavLink href="/tasks" icon={<CheckSquare className="h-4 w-4" />}>
              Tasks
            </NavLink>
            <NavLink href="/projects" icon={<Rocket className="h-4 w-4" />}>
              Projects
            </NavLink>
            <NavLink href="/achievements" icon={<Trophy className="h-4 w-4" />}>
              Achievements
            </NavLink>
            <NavLink href="/admin/notifications" icon={<Settings className="h-4 w-4" />}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {icon}
        <span>{children}</span>
      </motion.div>
    </Link>
  );
}
