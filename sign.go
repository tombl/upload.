package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func main() {
	var region, endpoint, bucket, object, duration string
	flag.StringVar(&region, "region", "", "the region the bucket is stored in")
	flag.StringVar(&endpoint, "endpoint", "", "the address and port of the endpoint")
	flag.StringVar(&bucket, "bucket", "", "the name of the bucket")
	flag.StringVar(&object, "object", "", "the path to the file")
	flag.StringVar(&duration, "duration", "24h", "how long the URL should last")
	flag.Parse()
	if region == "" || endpoint == "" || bucket == "" || object == "" {
		flag.Usage()
		os.Exit(1)
	}

	parsedDuration, err := time.ParseDuration(duration)
	if err != nil {
		fmt.Printf("parsing duration: %v\n", err)
		os.Exit(1)
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewEnvAWS(),
		Region: region,
	})
	if err != nil {
		fmt.Printf("connecting: %v\n", err)
		os.Exit(1)
	}

	url, err := client.PresignedPutObject(context.Background(), bucket, object, parsedDuration)
	if err != nil {
		fmt.Printf("creating URL: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(url.String())
}
