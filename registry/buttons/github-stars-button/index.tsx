'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type SpringOptions,
} from 'motion/react';

import { cn } from '@/lib/utils';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';

const formatNumber = (
  num: number,
): {
  number: number;
  unit: string;
} => {
  if (num < 1000) {
    return { number: num, unit: '' };
  }
  const units = ['k', 'M', 'B', 'T'];
  let unitIndex = 0;
  let n = num;
  while (n >= 1000 && unitIndex < units.length) {
    n /= 1000;
    unitIndex++;
  }
  const finalNumber = Math.round(n);
  return { number: finalNumber, unit: units[unitIndex - 1] };
};

const animations = {
  pulse: {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: [1.2, 1.8, 1.2], opacity: [0, 0.3, 0] },
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  glow: {
    initial: { scale: 1, opacity: 0 },
    animate: { scale: [1, 1.5], opacity: [0.8, 0] },
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  particle: (index: number) => ({
    initial: { x: '50%', y: '50%', scale: 0, opacity: 0 },
    animate: {
      x: `calc(50% + ${Math.cos((index * Math.PI) / 3) * 30}px)`,
      y: `calc(50% + ${Math.sin((index * Math.PI) / 3) * 30}px)`,
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    },
    transition: { duration: 0.8, delay: index * 0.05, ease: 'easeOut' },
  }),
};

interface GitHubStarsButtonProps extends HTMLMotionProps<'a'> {
  username: string;
  repo: string;
  transition?: SpringOptions;
  formatted?: boolean;
}

const GitHubStarsButton = React.forwardRef<
  HTMLAnchorElement,
  GitHubStarsButtonProps
>(
  (
    {
      username,
      repo,
      transition = { stiffness: 90, damping: 50 },
      formatted = false,
      className,
      ...props
    },
    ref,
  ) => {
    const motionVal = useMotionValue(0);
    const springVal = useSpring(motionVal, transition);
    const [motionNumber, setMotionNumber] = React.useState(0);
    const [stars, setStars] = React.useState(0);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [displayParticles, setDisplayParticles] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const repoUrl = React.useMemo(
      () => `https://github.com/${username}/${repo}`,
      [username, repo],
    );

    React.useEffect(() => {
      fetch(`https://api.github.com/repos/${username}/${repo}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && typeof data.stargazers_count === 'number') {
            setStars(data.stargazers_count);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [username, repo]);

    React.useEffect(() => {
      const unsubscribe = springVal.on('change', (latest: number) => {
        setMotionNumber(Math.round(latest));
      });
      return () => unsubscribe();
    }, [springVal]);

    React.useEffect(() => {
      if (stars > 0) motionVal.set(stars);
    }, [motionVal, stars]);

    const fillPercentage = React.useMemo(
      () => Math.min(100, (motionNumber / stars) * 100),
      [motionNumber, stars],
    );
    const { number, unit } = React.useMemo(
      () => formatNumber(motionNumber),
      [motionNumber],
    );

    const handleDisplayParticles = React.useCallback(() => {
      setDisplayParticles(true);
      setTimeout(() => setDisplayParticles(false), 1500);
    }, []);

    React.useEffect(() => {
      if (stars === 0) return;
      const completed = motionNumber >= stars;
      setIsCompleted(completed);
      if (completed) handleDisplayParticles();
    }, [handleDisplayParticles, motionNumber, stars]);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        handleDisplayParticles();
        setTimeout(() => window.open(repoUrl, '_blank'), 500);
      },
      [handleDisplayParticles, repoUrl],
    );

    if (isLoading) return null;

    return (
      <motion.a
        ref={ref}
        href={repoUrl}
        rel="noopener noreferrer"
        target="_blank"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2 h-9 has-[>svg]:px-3 cursor-pointer whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        <svg role="img" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
        <span>GitHub Stars</span>
        <div className="relative inline-flex size-[18px] shrink-0">
          <Star
            className="fill-muted-foreground text-muted-foreground"
            size={18}
            aria-hidden="true"
          />
          <Star
            className="absolute top-0 left-0 text-yellow-500 fill-yellow-500"
            aria-hidden="true"
            style={{
              clipPath: `inset(${100 - (isCompleted ? fillPercentage : fillPercentage - 10)}% 0 0 0)`,
            }}
          />
          <AnimatePresence>
            {displayParticles && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)',
                  }}
                  {...animations.pulse}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: '0 0 10px 2px rgba(255,215,0,0.6)' }}
                  {...animations.glow}
                />
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-yellow-500"
                    initial={animations.particle(i).initial}
                    animate={animations.particle(i).animate}
                    transition={animations.particle(i).transition}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {formatted ? (
          <span className="flex items-center gap-0.5">
            <SlidingNumber number={number} />
            {unit && <span>{unit}</span>}
          </span>
        ) : (
          <SlidingNumber number={motionNumber} />
        )}
      </motion.a>
    );
  },
);

GitHubStarsButton.displayName = 'GitHubStarsButton';

export { GitHubStarsButton, type GitHubStarsButtonProps };
