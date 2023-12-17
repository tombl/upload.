package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
	bucket := flag.String("bucket", "", "the name of the bucket")
	object := flag.String("object", "", "the object key")
	profile := flag.String("profile", "", "the AWS credentials profile to use")
	rawDuration := flag.String("duration", "24h", "how long until the presigned URL should expire")
	flag.Parse()

	if *bucket == "" || *object == "" {
		flag.Usage()
		os.Exit(1)
	}

	duration, err := time.ParseDuration(*rawDuration)
	if err != nil {
		fmt.Printf("parsing duration: %v\n", err)
		os.Exit(1)
	}

	opts := [](func(*config.LoadOptions) error){}
	if *profile != "" {
		opts = append(opts, config.WithSharedConfigProfile(*profile))
	}

	cfg, err := config.LoadDefaultConfig(context.Background(), opts...)
	if err != nil {
		fmt.Printf("unable to load AWS config: %v\n", err)
		os.Exit(1)
	}

	presign := s3.NewPresignClient(s3.NewFromConfig(cfg))

	request, err := presign.PresignPutObject(
		context.Background(),
		&s3.PutObjectInput{Bucket: bucket, Key: object},
		s3.WithPresignExpires(duration),
	)
	if err != nil {
		fmt.Printf("signing URL: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(request.URL)
}
