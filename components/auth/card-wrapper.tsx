import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
// import { Social } from "@/components/auth/social";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

type CardWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  headerTitle: string;
  headerDescription: string;
  backButtonLabel: string;
  backButtonHref: string;
  // showSocial?: boolean;
  heroImage?: string;
};

export const CardWrapper = (props: CardWrapperProps) => {
  const {
    heroImage,
    headerTitle,
    headerDescription,
    backButtonLabel,
    backButtonHref,
    // showSocial,
    children,
    ...rest
  } = props;

  return (
    <Card className="mx-4 w-[400px] shadow md:mx-0" {...rest}>
      {heroImage ? (
        <div className="relative mx-auto w-1/4 pt-6">
          <Image
            src={heroImage}
            alt="Hero Image"
            width={24}
            height={24}
            className="relative h-full w-full max-w-md select-none"
          />
        </div>
      ) : null}
      <CardHeader className="text-center">
        <CardTitle>{headerTitle}</CardTitle>
        <CardDescription>{headerDescription}</CardDescription>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
      {/* {showSocial ? (
        <>
          <CardFooter className="gap-x-2">
            <Separator className="shrink" />
            <p className="text-sm text-center basis-full">Or connect with</p>
            <Separator className="shrink" />
          </CardFooter>
          <CardFooter>
            <Social />
          </CardFooter>
        </>
      ) : null} */}
      <Separator />
      <CardFooter className="py-3">
        <Button variant="link" className="w-full font-normal" size="sm" asChild>
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
